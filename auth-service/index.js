const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const cors = require('cors'); // Importa el paquete de CORS

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Usa el middleware de CORS

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Esquema y modelo de usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  temp_secret: { type: String },
  verified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Función auxiliar para enviar correos electrónicos
const sendEmail = (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Ruta de registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const temp_secret = speakeasy.generateSecret().base32;

  const newUser = new User({
    email,
    password: hashedPassword,
    temp_secret
  });

  try {
    await newUser.save();
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const verificationUrl = `http://localhost:${process.env.PORT}/verify?token=${token}&secret=${temp_secret}`;

    sendEmail(email, 'Verify your email', `Click the following link to verify your email: ${verificationUrl}`);

    res.status(201).send('User registered. Check your email for verification link.');
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Error registering user');
  }
});

// Ruta de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
