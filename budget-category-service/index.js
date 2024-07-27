const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const budgetCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  email: { type: String, required: true }
});

const BudgetCategory = mongoose.model('BudgetCategory', budgetCategorySchema);

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

// Rutas documentadas con Swagger
/**
 * @swagger
 * tags:
 *   name: BudgetCategory
 *   description: Budget category management
 */

/**
 * @swagger
 * /budget-categories:
 *   get:
 *     summary: Get all budget categories
 *     tags: [BudgetCategory]
 *     responses:
 *       200:
 *         description: List of budget categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   category:
 *                     type: string
 *                   budget:
 *                     type: number
 *                   email:
 *                     type: string
 */
app.get('/budget-categories', authenticate, async (req, res) => {
  try {
    const categories = await BudgetCategory.find({ email: req.user.email });
    res.json(categories);
  } catch (error) {
    res.status(500).send('Error getting budget categories');
  }
});

/**
 * @swagger
 * /budget-categories:
 *   post:
 *     summary: Create a new budget category
 *     tags: [BudgetCategory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Budget category created successfully
 *       400:
 *         description: Invalid input
 */
app.post('/budget-categories', authenticate, async (req, res) => {
  const { category, budget } = req.body;

  const newCategory = new BudgetCategory({
    category,
    budget,
    email: req.user.email
  });

  try {
    await newCategory.save();
    res.status(201).json({ message: 'Budget category created' });
  } catch (error) {
    res.status(500).send('Error creating budget category');
  }
});

/**
 * @swagger
 * /budget-categories/{id}:
 *   put:
 *     summary: Update a budget category
 *     tags: [BudgetCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The budget category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Budget category updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Budget category not found
 */
app.put('/budget-categories/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { category, budget } = req.body;

  try {
    const updatedCategory = await BudgetCategory.findOneAndUpdate(
      { _id: id, email: req.user.email },
      { category, budget },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).send('Budget category not found');
    }
    res.json({ message: 'Budget category updated' });
  } catch (error) {
    res.status(500).send('Error updating budget category');
  }
});

/**
 * @swagger
 * /budget-categories/{id}:
 *   delete:
 *     summary: Delete a budget category
 *     tags: [BudgetCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The budget category ID
 *     responses:
 *       200:
 *         description: Budget category deleted successfully
 *       404:
 *         description: Budget category not found
 */
app.delete('/budget-categories/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await BudgetCategory.findOneAndDelete({ _id: id, email: req.user.email });
    if (!deletedCategory) {
      return res.status(404).send('Budget category not found');
    }
    res.json({ message: 'Budget category deleted' });
  } catch (error) {
    res.status(500).send('Error deleting budget category');
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Budget Category service running on port ${PORT}`);
});
