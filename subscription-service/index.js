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

// Esquema y modelo de suscripciones
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management
 */

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of subscriptions
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
 *                   name:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date
 */
app.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).send('Error getting subscriptions');
  }
});

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid input
 */
app.post('/subscriptions', async (req, res) => {
  const { email, name, amount, date } = req.body;

  const newSubscription = new Subscription({
    email,
    name,
    amount,
    date
  });

  try {
    await newSubscription.save();
    res.status(201).json({ message: 'Subscription created successfully' });
  } catch (error) {
    res.status(500).send('Error creating subscription');
  }
});

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Delete a subscription
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The subscription ID
 *     responses:
 *       200:
 *         description: Subscription deleted successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Subscription not found
 */
app.delete('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Subscription.findByIdAndDelete(id);
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).send('Error deleting subscription');
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Subscription service running on port ${PORT}`);
});
