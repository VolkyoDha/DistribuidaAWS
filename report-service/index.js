const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Ruta para obtener el reporte consolidado
app.get('/report', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Obtener información de los microservicios
    const [transactions, subscriptions, debts] = await Promise.all([
      axios.get(`${process.env.TRANSACTION_SERVICE_URL}/transactions`, { headers: { Authorization: `Bearer ${req.headers['authorization']}` } }),
      axios.get(`${process.env.SUBSCRIPTION_SERVICE_URL}/subscriptions`, { headers: { Authorization: `Bearer ${req.headers['authorization']}` } }),
      axios.get(`${process.env.DEBT_SERVICE_URL}/debts`, { headers: { Authorization: `Bearer ${req.headers['authorization']}` } }),
    ]);

    const totalIncome = transactions.data.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions.data.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const totalSubscriptions = subscriptions.data.reduce((sum, sub) => sum + sub.amount, 0);
    const totalDebts = debts.data.reduce((sum, debt) => sum + debt.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      totalSubscriptions,
      totalDebts
    });
  } catch (error) {
    console.error('Error generating report:', error.message);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Report service running on port ${PORT}`);
});
