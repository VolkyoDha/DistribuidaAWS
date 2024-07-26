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

// Conectar a la base de datos de MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Esquemas y modelos de MongoDB
const sourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  email: { type: String, required: true }
});

const goalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  email: { type: String, required: true }
});

const Source = mongoose.model('Source', sourceSchema);
const Goal = mongoose.model('Goal', goalSchema);

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

// Ruta para obtener las fuentes y metas
app.get('/get-sources-goals', authenticate, async (req, res) => {
  try {
    const sources = await Source.find({ email: req.user.email });
    const goals = await Goal.find({ email: req.user.email });
    res.json({ sources, goals });
  } catch (error) {
    console.error('Error retrieving sources and goals:', error);
    res.status(500).send('Error retrieving sources and goals');
  }
});

// Ruta para agregar una fuente de dinero
app.post('/add-source', authenticate, async (req, res) => {
  const { name, amount } = req.body;

  const newSource = new Source({
    name,
    amount,
    email: req.user.email
  });

  try {
    await newSource.save();
    res.status(201).send('Source added');
  } catch (error) {
    console.error('Error adding source:', error);
    res.status(500).send('Error adding source');
  }
});

// Ruta para agregar una meta de ahorro
app.post('/add-goal', authenticate, async (req, res) => {
  const { name, amount } = req.body;

  const newGoal = new Goal({
    name,
    amount,
    email: req.user.email
  });

  try {
    await newGoal.save();
    res.status(201).send('Goal added');
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).send('Error adding goal');
  }
});

// Ruta de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
