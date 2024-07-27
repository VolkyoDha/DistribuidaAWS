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

// Ruta de reloj mundial
/**
 * @swagger
 * tags:
 *   name: WorldClock
 *   description: World clock management
 */

/**
 * @swagger
 * /world-clock:
 *   get:
 *     summary: Get current time for a specific city
 *     tags: [WorldClock]
 *     parameters:
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *         required: true
 *         description: Timezone of the city (e.g., "America/New_York")
 *     responses:
 *       200:
 *         description: Current time retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datetime:
 *                   type: string
 */
app.get('/world-clock', async (req, res) => {
  const timezone = req.query.timezone || 'Etc/UTC';
  const apiUrl = `http://worldtimeapi.org/api/timezone/${timezone}`;

  try {
    const response = await axios.get(apiUrl);
    const datetime = response.data.datetime;
    res.json({ datetime });
  } catch (error) {
    res.status(500).send('Error retrieving time data');
  }
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3019;
app.listen(PORT, () => {
  console.log(`World Clock service running on port ${PORT}`);
});
