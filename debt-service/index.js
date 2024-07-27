const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Esquema y modelo de deudas
const debtSchema = new mongoose.Schema({
  creditor: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String },
  email: { type: String, required: true }
});

const Debt = mongoose.model('Debt', debtSchema);

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: Debt
 *   description: Debt management
 */

/**
 * @swagger
 * /debts:
 *   get:
 *     summary: Get all debts
 *     tags: [Debt]
 *     responses:
 *       200:
 *         description: List of debts
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
 *                   creditor:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   dueDate:
 *                     type: string
 *                     format: date
 *                   description:
 *                     type: string
 */
app.get('/debts', async (req, res) => {
  try {
    const debts = await Debt.find();
    res.json(debts);
  } catch (error) {
    res.status(500).send('Error getting debts');
  }
});
app.get('/debts', async (req, res) => {
  try {
    const debts = await Debt.find();
    res.json(debts);
  } catch (error) {
    res.status(500).send('Error getting debts');
  }
});

/**
 * @swagger
 * /debts:
 *   post:
 *     summary: Create a new debt
 *     tags: [Debt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               creditor:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Debt created successfully
 *       400:
 *         description: Invalid input
 */
app.post('/debts', async (req, res) => {
  const { email, creditor, amount, dueDate, description } = req.body;

  const newDebt = new Debt({
    email,
    creditor,
    amount,
    dueDate,
    description
  });

  try {
    await newDebt.save();
    res.status(201).json({ message: 'Debt created successfully' });
  } catch (error) {
    res.status(500).send('Error creating debt');
  }
});
/**
 * @swagger
 * /debts/{id}:
 *   put:
 *     summary: Update a debt
 *     tags: [Debt]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The debt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               creditor:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Debt updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Debt not found
 */
app.put('/debts/:id', async (req, res) => {
  const { id } = req.params;
  const { email, creditor, amount, dueDate, description } = req.body;

  try {
    const updatedDebt = await Debt.findByIdAndUpdate(id, { email, creditor, amount, dueDate, description }, { new: true });
    if (!updatedDebt) {
      return res.status(404).send('Debt not found');
    }
    res.json({ message: 'Debt updated successfully' });
  } catch (error) {
    res.status(500).send('Error updating debt');
  }
});

/**
 * @swagger
 * /debts/{id}:
 *   delete:
 *     summary: Delete a debt
 *     tags: [Debt]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The debt ID
 *     responses:
 *       200:
 *         description: Debt deleted successfully
 *       404:
 *         description: Debt not found
 */
app.delete('/debts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDebt = await Debt.findByIdAndDelete(id);
    if (!deletedDebt) {
      return res.status(404).send('Debt not found');
    }
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).send('Error deleting debt');
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Debt service running on port ${PORT}`);
});
