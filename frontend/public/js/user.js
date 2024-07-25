document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  const moneySourceForm = document.getElementById('moneySourceForm');
  const savingGoalForm = document.getElementById('savingGoalForm');
  const transactionForm = document.getElementById('transactionForm');
  const subscriptionForm = document.getElementById('subscriptionForm');
  const debtForm = document.getElementById('debtForm');
  const sourcesGoalsDiv = document.getElementById('sourcesGoals');
  const transactionsDiv = document.getElementById('transactions');
  const subscriptionsDiv = document.getElementById('subscriptions');
  const debtsDiv = document.getElementById('debts');
  const editTransactionModal = document.getElementById('editTransactionModal');
  const closeTransactionModal = document.getElementById('closeTransactionModal');
  const editTransactionForm = document.getElementById('editTransactionForm');
  const editDebtModal = document.getElementById('editDebtModal');
  const closeDebtModal = document.getElementById('closeDebtModal');
  const editDebtForm = document.getElementById('editDebtForm');

  closeTransactionModal.onclick = () => {
    editTransactionModal.style.display = 'none';
  };

  closeDebtModal.onclick = () => {
    editDebtModal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === editTransactionModal) {
      editTransactionModal.style.display = 'none';
    }
    if (event.target === editDebtModal) {
      editDebtModal.style.display = 'none';
    }
  };

  // Función para agregar una fuente de dinero
  moneySourceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const source = document.getElementById('source').value;
    const amount = document.getElementById('amount').value;

    try {
      const response = await fetch('http://localhost:3001/add-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ source, amount })
      });

      if (!response.ok) {
        throw new Error('Failed to add source');
      }

      const data = await response.json();
      alert(data.message);
      displaySourcesAndGoals();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add source');
    }
  });

  // Función para agregar una meta de ahorro
  savingGoalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goal = document.getElementById('goal').value;
    const amountGoal = document.getElementById('amountGoal').value;

    try {
      const response = await fetch('http://localhost:3001/add-savings-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goal, amount: amountGoal })
      });

      if (!response.ok) {
        throw new Error('Failed to add saving goal');
      }

      const data = await response.json();
      alert(data.message);
      displaySourcesAndGoals();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add saving goal');
    }
  });

  // Función para agregar una transacción
  transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const amountTransaction = document.getElementById('amountTransaction').value;
    const description = document.getElementById('description').value;

    try {
      const response = await fetch('http://localhost:3002/add-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, amount: amountTransaction, description })
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      const data = await response.json();
      alert(data.message);
      displayTransactions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add transaction');
    }
  });

  // Función para mostrar fuentes de dinero y metas de ahorro
  const displaySourcesAndGoals = async () => {
    try {
      const response = await fetch('http://localhost:3001/get-sources-goals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve sources and goals');
      }

      const data = await response.json();
      sourcesGoalsDiv.innerHTML = `
        <h3>Money Sources</h3>
        <ul>
          ${data.sources.map(source => `<li>${source.source} - ${source.amount}</li>`).join('')}
        </ul>
        <h3>Saving Goals</h3>
        <ul>
          ${data.goals.map(goal => `<li>${goal.goal} - ${goal.amount}</li>`).join('')}
        </ul>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve sources and goals');
    }
  };

  // Función para mostrar transacciones
  const displayTransactions = async () => {
    try {
      const response = await fetch('http://localhost:3002/transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve transactions');
      }

      const data = await response.json();
      transactionsDiv.innerHTML = `
        <ul>
          ${data.map(transaction => `
            <li>
              ${transaction.type} - ${transaction.amount} - ${transaction.description}
              <button onclick="editTransaction('${transaction._id}', '${transaction.type}', ${transaction.amount}, '${transaction.description}')">Edit</button>
              <button onclick="deleteTransaction('${transaction._id}')">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve transactions');
    }
  };

  // Función para eliminar una transacción
  window.deleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/transaction/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      const data = await response.json();
      alert(data.message);
      displayTransactions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete transaction');
    }
  };

  // Función para mostrar el modal de edición con los datos de la transacción a editar
  window.editTransaction = (id, type, amount, description) => {
    document.getElementById('editTransactionId').value = id;
    document.getElementById('editType').value = type;
    document.getElementById('editAmount').value = amount;
    document.getElementById('editDescription').value = description;
    editTransactionModal.style.display = 'block';
  };

  // Función para actualizar una transacción
  editTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editTransactionId').value;
    const type = document.getElementById('editType').value;
    const amount = document.getElementById('editAmount').value;
    const description = document.getElementById('editDescription').value;

    try {
      const response = await fetch(`http://localhost:3002/transaction/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, amount, description })
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const data = await response.json();
      alert(data.message);
      editTransactionModal.style.display = 'none';
      displayTransactions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update transaction');
    }
  });

  // Función para agregar una suscripción
  subscriptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('subscriptionName').value;
    const amount = document.getElementById('subscriptionAmount').value;
    const date = document.getElementById('subscriptionDate').value;

    try {
      const response = await fetch('http://localhost:3003/add-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, amount, date })
      });

      if (!response.ok) {
        throw new Error('Failed to add subscription');
      }

      const data = await response.json();
      alert(data.message);
      displaySubscriptions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add subscription');
    }
  });

  // Función para mostrar suscripciones
  const displaySubscriptions = async () => {
    try {
      const response = await fetch('http://localhost:3003/subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve subscriptions');
      }

      const data = await response.json();
      subscriptionsDiv.innerHTML = `
        <ul>
          ${data.map(subscription => `
            <li>
              ${subscription.name} - ${subscription.amount} - ${new Date(subscription.date).toLocaleDateString()}
              <button onclick="deleteSubscription('${subscription._id}')">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve subscriptions');
    }
  };

  // Función para eliminar una suscripción
  window.deleteSubscription = async (id) => {
    try {
      const response = await fetch(`http://localhost:3003/subscription/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }

      const data = await response.json();
      alert(data.message);
      displaySubscriptions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete subscription');
    }
  };

  // Función para agregar una deuda
  debtForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const creditor = document.getElementById('creditor').value;
    const amount = document.getElementById('debtAmount').value;
    const dueDate = document.getElementById('dueDate').value;
    const description = document.getElementById('debtDescription').value;

    try {
      const response = await fetch('http://localhost:3004/add-debt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creditor, amount, dueDate, description })
      });

      if (!response.ok) {
        throw new Error('Failed to add debt');
      }

      const data = await response.json();
      alert(data.message);
      displayDebts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add debt');
    }
  });

  // Función para mostrar deudas
  const displayDebts = async () => {
    try {
      const response = await fetch('http://localhost:3004/debts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve debts');
      }

      const data = await response.json();
      debtsDiv.innerHTML = `
        <ul>
          ${data.map(debt => `
            <li>
              ${debt.creditor} - ${debt.amount} - ${new Date(debt.dueDate).toLocaleDateString()} - ${debt.description}
              <button onclick="editDebt('${debt._id}', '${debt.creditor}', ${debt.amount}, '${debt.dueDate}', '${debt.description}')">Edit</button>
              <button onclick="deleteDebt('${debt._id}')">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve debts');
    }
  };

  // Función para eliminar una deuda
  window.deleteDebt = async (id) => {
    try {
      const response = await fetch(`http://localhost:3004/debt/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete debt');
      }

      const data = await response.json();
      alert(data.message);
      displayDebts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete debt');
    }
  };

  // Función para mostrar el modal de edición con los datos de la deuda a editar
  window.editDebt = (id, creditor, amount, dueDate, description) => {
    document.getElementById('editDebtId').value = id;
    document.getElementById('editCreditor').value = creditor;
    document.getElementById('editDebtAmount').value = amount;
    document.getElementById('editDueDate').value = new Date(dueDate).toISOString().substring(0, 10);
    document.getElementById('editDebtDescription').value = description;
    editDebtModal.style.display = 'block';
  };

  // Función para actualizar una deuda
  editDebtForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editDebtId').value;
    const creditor = document.getElementById('editCreditor').value;
    const amount = document.getElementById('editDebtAmount').value;
    const dueDate = document.getElementById('editDueDate').value;
    const description = document.getElementById('editDebtDescription').value;

    try {
      const response = await fetch(`http://localhost:3004/debt/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creditor, amount, dueDate, description })
      });

      if (!response.ok) {
        throw new Error('Failed to update debt');
      }

      const data = await response.json();
      alert(data.message);
      editDebtModal.style.display = 'none';
      displayDebts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update debt');
    }
  });

  // Mostrar fuentes de dinero, metas de ahorro, transacciones, suscripciones y deudas al cargar la página
  displaySourcesAndGoals();
  displayTransactions();
  displaySubscriptions();
  displayDebts();
});
