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

// Esquema y modelo de transacción
const transactionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Ruta para agregar una transacción
app.post('/add-transaction', authenticate, async (req, res) => {
  const { type, amount, description } = req.body;
  const newTransaction = new Transaction({
    email: req.user.email,
    type,
    amount,
    description
  });

  try {
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error adding transaction' });
  }
});

// Ruta para listar transacciones
app.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ email: req.user.email });
    res.json(transactions);
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions' });
  }
});

// Ruta para eliminar una transacción
app.delete('/transaction/:id', authenticate, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

// Ruta para actualizar una transacción
app.put('/transaction/:id', authenticate, async (req, res) => {
  const { type, amount, description } = req.body;
  
  try {
    await Transaction.findByIdAndUpdate(req.params.id, { type, amount, description });
    res.status(200).json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Transaction service running on port ${PORT}`);
});
