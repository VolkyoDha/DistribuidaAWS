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

const API_KEY = process.env.NEWS_API_KEY;

// Documentación con Swagger
/**
 * @swagger
 * tags:
 *   name: News
 *   description: News information
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get latest news
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query for news articles
 *     responses:
 *       200:
 *         description: List of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   url:
 *                     type: string
 */
app.get('/news', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send('Query is required');
  }

  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&apiKey=${API_KEY}`);
    const newsData = response.data.articles;

    res.json(newsData.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url
    })));
  } catch (error) {
    res.status(500).send('Error retrieving news data');
  }
});

// Ruta de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3017;
app.listen(PORT, () => {
  console.log(`News service running on port ${PORT}`);
});
