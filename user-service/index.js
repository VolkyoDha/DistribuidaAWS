const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};

// Esquema y modelo de fuente de dinero
const moneySourceSchema = new mongoose.Schema({
  email: { type: String, required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true }
});

const MoneySource = mongoose.model('MoneySource', moneySourceSchema);

// Esquema y modelo de meta de ahorro
const savingGoalSchema = new mongoose.Schema({
  email: { type: String, required: true },
  goal: { type: String, required: true },
  amount: { type: Number, required: true }
});

const SavingGoal = mongoose.model('SavingGoal', savingGoalSchema);

// Ruta para agregar una fuente de dinero
app.post('/add-source', authenticate, async (req, res) => {
  const { source, amount } = req.body;
  const newSource = new MoneySource({
    email: req.user.email,
    source,
    amount: Number(amount) // Asegurarse de que amount sea un número
  });

  try {
    await newSource.save();
    res.status(201).json({ message: 'Source added successfully' }); // Enviar respuesta JSON válida
  } catch (error) {
    console.error('Error adding source:', error);
    res.status(500).json({ message: 'Error adding source' }); // Enviar respuesta JSON válida
  }
});

// Ruta para agregar una meta de ahorro
app.post('/add-savings-goal', authenticate, async (req, res) => {
  const { goal, amount } = req.body;
  const newGoal = new SavingGoal({
    email: req.user.email,
    goal,
    amount: Number(amount) // Asegurarse de que amount sea un número
  });

  try {
    await newGoal.save();
    res.status(201).json({ message: 'Saving goal added successfully' }); // Enviar respuesta JSON válida
  } catch (error) {
    console.error('Error adding saving goal:', error);
    res.status(500).json({ message: 'Error adding saving goal' }); // Enviar respuesta JSON válida
  }
});

// Ruta para obtener fuentes de dinero y metas de ahorro
app.get('/get-sources-goals', authenticate, async (req, res) => {
  try {
    const sources = await MoneySource.find({ email: req.user.email });
    const goals = await SavingGoal.find({ email: req.user.email });
    res.json({ sources, goals }); // Enviar respuesta JSON válida
  } catch (error) {
    console.error('Error retrieving sources and goals:', error);
    res.status(500).json({ message: 'Error retrieving sources and goals' }); // Enviar respuesta JSON válida
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
