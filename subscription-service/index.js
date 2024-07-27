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

// Esquema y modelo de suscripciones
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

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
app.get('/subscriptions', authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ email: req.user.email });
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
app.post('/subscriptions', authenticate, async (req, res) => {
  const { name, amount, date } = req.body;

  const newSubscription = new Subscription({
    email: req.user.email,
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
app.delete('/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOneAndDelete({ _id: id, email: req.user.email });

    if (!subscription) {
      return res.status(404).send('Subscription not found');
    }

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
