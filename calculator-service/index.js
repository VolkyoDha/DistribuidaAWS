const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: Calculator
 *   description: Basic arithmetic operations
 */

/**
 * @swagger
 * /add:
 *   get:
 *     summary: Add two numbers
 *     tags: [Calculator]
 *     parameters:
 *       - in: query
 *         name: a
 *         schema:
 *           type: number
 *         required: true
 *         description: The first number
 *       - in: query
 *         name: b
 *         schema:
 *           type: number
 *         required: true
 *         description: The second number
 *     responses:
 *       200:
 *         description: Result of the addition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 */
app.get('/add', (req, res) => {
  const { a, b } = req.query;
  const result = parseFloat(a) + parseFloat(b);
  res.json({ result });
});

/**
 * @swagger
 * /subtract:
 *   get:
 *     summary: Subtract two numbers
 *     tags: [Calculator]
 *     parameters:
 *       - in: query
 *         name: a
 *         schema:
 *           type: number
 *         required: true
 *         description: The first number
 *       - in: query
 *         name: b
 *         schema:
 *           type: number
 *         required: true
 *         description: The second number
 *     responses:
 *       200:
 *         description: Result of the subtraction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 */
app.get('/subtract', (req, res) => {
  const { a, b } = req.query;
  const result = parseFloat(a) - parseFloat(b);
  res.json({ result });
});

/**
 * @swagger
 * /multiply:
 *   get:
 *     summary: Multiply two numbers
 *     tags: [Calculator]
 *     parameters:
 *       - in: query
 *         name: a
 *         schema:
 *           type: number
 *         required: true
 *         description: The first number
 *       - in: query
 *         name: b
 *         schema:
 *           type: number
 *         required: true
 *         description: The second number
 *     responses:
 *       200:
 *         description: Result of the multiplication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 */
app.get('/multiply', (req, res) => {
  const { a, b } = req.query;
  const result = parseFloat(a) * parseFloat(b);
  res.json({ result });
});

/**
 * @swagger
 * /divide:
 *   get:
 *     summary: Divide two numbers
 *     tags: [Calculator]
 *     parameters:
 *       - in: query
 *         name: a
 *         schema:
 *           type: number
 *         required: true
 *         description: The first number
 *       - in: query
 *         name: b
 *         schema:
 *           type: number
 *         required: true
 *         description: The second number
 *     responses:
 *       200:
 *         description: Result of the division
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 */
app.get('/divide', (req, res) => {
  const { a, b } = req.query;
  const result = parseFloat(a) / parseFloat(b);
  res.json({ result });
});

// Ruta de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3015;
app.listen(PORT, () => {
  console.log(`Calculator service running on port ${PORT}`);
});
