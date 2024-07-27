const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.EXCHANGE_API_KEY;

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency exchange rates
 */

/**
 * @swagger
 * /exchange-rate:
 *   get:
 *     summary: Get exchange rate
 *     tags: [Currency]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *         required: true
 *         description: The base currency
 *       - in: query
 *         name: target
 *         schema:
 *           type: string
 *         required: true
 *         description: The target currency
 *     responses:
 *       200:
 *         description: Exchange rate information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base:
 *                   type: string
 *                 target:
 *                   type: string
 *                 rate:
 *                   type: number
 */
app.get('/exchange-rate', async (req, res) => {
  const { base, target } = req.query;
  if (!base || !target) {
    return res.status(400).send('Base and target currencies are required');
  }

  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`);
    const rate = response.data.conversion_rates[target];

    if (!rate) {
      return res.status(404).send('Exchange rate not found');
    }

    res.json({ base, target, rate });
  } catch (error) {
    res.status(500).send('Error retrieving exchange rate');
  }
});

// Ruta de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3016;
app.listen(PORT, () => {
  console.log(`Currency Exchange service running on port ${PORT}`);
});
