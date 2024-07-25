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

// Esquema y modelo de suscripción
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Ruta para agregar una suscripción
app.post('/add-subscription', authenticate, async (req, res) => {
  const { name, amount, date } = req.body;
  const newSubscription = new Subscription({
    email: req.user.email,
    name,
    amount,
    date: date || Date.now()
  });

  try {
    await newSubscription.save();
    res.status(201).json({ message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Error adding subscription:', error);
    res.status(500).json({ message: 'Error adding subscription' });
  }
});

// Ruta para listar suscripciones
app.get('/subscriptions', authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ email: req.user.email });
    res.json(subscriptions);
  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    res.status(500).json({ message: 'Error retrieving subscriptions' });
  }
});

// Ruta para eliminar una suscripción
app.delete('/subscription/:id', authenticate, async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Subscription service running on port ${PORT}`);
});
