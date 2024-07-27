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

// Esquema y modelo de lista de compras
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const shoppingListSchema = new mongoose.Schema({
  email: { type: String, required: true },
  items: [itemSchema],
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

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

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: ShoppingList
 *   description: Shopping list management
 */

/**
 * @swagger
 * /shopping-lists:
 *   get:
 *     summary: Get all shopping lists
 *     tags: [ShoppingList]
 *     responses:
 *       200:
 *         description: List of shopping lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         quantity:
 *                           type: number
 */
app.get('/shopping-lists', authenticate, async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({ email: req.user.email });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).send('Error getting shopping lists');
  }
});

/**
 * @swagger
 * /shopping-lists:
 *   post:
 *     summary: Create a new shopping list
 *     tags: [ShoppingList]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Shopping list created successfully
 *       400:
 *         description: Invalid input
 */
app.post('/shopping-lists', authenticate, async (req, res) => {
  const { items } = req.body;

  const newShoppingList = new ShoppingList({
    email: req.user.email,
    items
  });

  try {
    await newShoppingList.save();
    res.status(201).send('Shopping list created');
  } catch (error) {
    res.status(500).send('Error creating shopping list');
  }
});

// Ruta de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Shopping List service running on port ${PORT}`);
});
