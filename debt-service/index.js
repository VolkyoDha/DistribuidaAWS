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

// Esquema y modelo de deuda
const debtSchema = new mongoose.Schema({
  email: { type: String, required: true },
  creditor: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String }
});

const Debt = mongoose.model('Debt', debtSchema);

// Ruta para agregar una deuda
app.post('/add-debt', authenticate, async (req, res) => {
  const { creditor, amount, dueDate, description } = req.body;
  const newDebt = new Debt({
    email: req.user.email,
    creditor,
    amount,
    dueDate,
    description
  });

  try {
    await newDebt.save();
    res.status(201).json({ message: 'Debt added successfully' });
  } catch (error) {
    console.error('Error adding debt:', error);
    res.status(500).json({ message: 'Error adding debt' });
  }
});

// Ruta para listar deudas
app.get('/debts', authenticate, async (req, res) => {
  try {
    const debts = await Debt.find({ email: req.user.email });
    res.json(debts);
  } catch (error) {
    console.error('Error retrieving debts:', error);
    res.status(500).json({ message: 'Error retrieving debts' });
  }
});

// Ruta para eliminar una deuda
app.delete('/debt/:id', authenticate, async (req, res) => {
  try {
    await Debt.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Debt deleted successfully' });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({ message: 'Error deleting debt' });
  }
});

// Ruta para actualizar una deuda
app.put('/debt/:id', authenticate, async (req, res) => {
  const { creditor, amount, dueDate, description } = req.body;

  try {
    await Debt.findByIdAndUpdate(req.params.id, { creditor, amount, dueDate, description });
    res.status(200).json({ message: 'Debt updated successfully' });
  } catch (error) {
    console.error('Error updating debt:', error);
    res.status(500).json({ message: 'Error updating debt' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Debt service running on port ${PORT}`);
});
