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

// Esquema y modelo de presupuesto por categoría
const budgetCategorySchema = new mongoose.Schema({
  email: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true }
});

const BudgetCategory = mongoose.model('BudgetCategory', budgetCategorySchema);

// Ruta para agregar un presupuesto por categoría
app.post('/add-budget-category', authenticate, async (req, res) => {
  const { category, budget } = req.body;
  const newBudgetCategory = new BudgetCategory({
    email: req.user.email,
    category,
    budget
  });

  try {
    await newBudgetCategory.save();
    res.status(201).json({ message: 'Budget category added successfully' });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({ message: 'Error adding budget category' });
  }
});

// Ruta para listar presupuestos por categoría
app.get('/budget-categories', authenticate, async (req, res) => {
  try {
    const budgetCategories = await BudgetCategory.find({ email: req.user.email });
    res.json(budgetCategories);
  } catch (error) {
    console.error('Error retrieving budget categories:', error);
    res.status(500).json({ message: 'Error retrieving budget categories' });
  }
});

// Ruta para eliminar un presupuesto por categoría
app.delete('/budget-category/:id', authenticate, async (req, res) => {
  try {
    await BudgetCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Budget category deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({ message: 'Error deleting budget category' });
  }
});

// Ruta para actualizar un presupuesto por categoría
app.put('/budget-category/:id', authenticate, async (req, res) => {
  const { category, budget } = req.body;

  try {
    await BudgetCategory.findByIdAndUpdate(req.params.id, { category, budget });
    res.status(200).json({ message: 'Budget category updated successfully' });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({ message: 'Error updating budget category' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Budget category service running on port ${PORT}`);
});
