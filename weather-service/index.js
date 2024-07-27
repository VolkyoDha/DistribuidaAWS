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

// Ruta de clima
/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: Weather management
 */

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get weather data for a specific city
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 temperature:
 *                   type: number
 *                 description:
 *                   type: string
 */
app.get('/weather', async (req, res) => {
  const city = req.query.city || 'Quito';
  const apiKey = '50eead92bf1f4e0a343fc5ac32124fd3';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    const temperature = response.data.main.temp;
    const description = response.data.weather[0].description;
    res.json({ temperature, description });
  } catch (error) {
    res.status(500).send('Error retrieving weather data');
  }
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3018;
app.listen(PORT, () => {
  console.log(`Weather service running on port ${PORT}`);
});
