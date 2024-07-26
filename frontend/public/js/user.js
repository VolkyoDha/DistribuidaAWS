document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);

  const moneySourceForm = document.getElementById('moneySourceForm');
  const savingGoalForm = document.getElementById('savingGoalForm');
  const transactionForm = document.getElementById('transactionForm');
  const subscriptionForm = document.getElementById('subscriptionForm');
  const debtForm = document.getElementById('debtForm');
  const budgetCategoryForm = document.getElementById('budgetCategoryForm');
  const sourcesGoalsDiv = document.getElementById('sourcesGoals');
  const savingGoalsDiv = document.getElementById('savingGoals');
  const transactionsDiv = document.getElementById('transactions');
  const subscriptionsDiv = document.getElementById('subscriptions');
  const debtsDiv = document.getElementById('debts');
  const budgetCategoriesDiv = document.getElementById('budgetCategories');
  const editTransactionModal = document.getElementById('editTransactionModal');
  const closeTransactionModal = document.getElementById('closeTransactionModal');
  const editTransactionForm = document.getElementById('editTransactionForm');
  const editDebtModal = document.getElementById('editDebtModal');
  const closeDebtModal = document.getElementById('closeDebtModal');
  const editDebtForm = document.getElementById('editDebtForm');
  const editBudgetCategoryModal = document.getElementById('editBudgetCategoryModal');
  const closeBudgetCategoryModal = document.getElementById('closeBudgetCategoryModal');
  const editBudgetCategoryForm = document.getElementById('editBudgetCategoryForm');

  closeTransactionModal.onclick = () => {
    editTransactionModal.style.display = 'none';
  };

  closeDebtModal.onclick = () => {
    editDebtModal.style.display = 'none';
  };

  closeBudgetCategoryModal.onclick = () => {
    editBudgetCategoryModal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === editTransactionModal) {
      editTransactionModal.style.display = 'none';
    }
    if (event.target === editDebtModal) {
      editDebtModal.style.display = 'none';
    }
    if (event.target === editBudgetCategoryModal) {
      editBudgetCategoryModal.style.display = 'none';
    }
  };

  

  // Función para mostrar las fuentes y metas
  const displaySourcesAndGoals = async () => {
    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/get-sources-goals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      sourcesGoalsDiv.innerHTML = '';
      savingGoalsDiv.innerHTML = '';

      const sourcesList = document.createElement('ul');
      data.sources.forEach(source => {
        const li = document.createElement('li');
        li.textContent = `${source.name} - ${source.amount}`;
        sourcesList.appendChild(li);
      });
      sourcesGoalsDiv.appendChild(sourcesList);

      const goalsList = document.createElement('ul');
      data.goals.forEach(goal => {
        const li = document.createElement('li');
        li.textContent = `${goal.name} - ${goal.amount}`;
        goalsList.appendChild(li);
      });
      savingGoalsDiv.appendChild(goalsList);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve sources and goals');
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
        body: JSON.stringify({ name: source, amount: parseFloat(amount) })
      });

      if (!response.ok) {
        throw new Error('Failed to add source');
      }

      alert('Source added successfully');
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
      const response = await fetch('http://localhost:3001/add-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: goal, amount: parseFloat(amountGoal) })
      });

      if (!response.ok) {
        throw new Error('Failed to add goal');
      }

      alert('Goal added successfully');
      displaySourcesAndGoals();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add goal');
    }
  });

  // Función para agregar una transacción
  transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = 'example@example.com'; // Asegúrate de proporcionar el email correcto
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amountTransaction').value;
    const description = document.getElementById('description').value;

    try {
      const response = await fetch('http://localhost:3002/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, type, amount, description })
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      alert('Transaction added successfully');
      displayTransactions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add transaction');
    }
  });

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
      const response = await fetch(`http://localhost:3002/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      alert('Transaction deleted successfully');
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
      const response = await fetch(`http://localhost:3002/transactions/${id}`, {
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

      alert('Transaction updated successfully');
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
    const email = 'example@example.com'; // Asegúrate de proporcionar el email correcto
    const name = document.getElementById('subscriptionName').value;
    const amount = document.getElementById('subscriptionAmount').value;
    const date = document.getElementById('subscriptionDate').value;

    try {
      const response = await fetch('http://localhost:3003/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, name, amount, date })
      });

      if (!response.ok) {
        throw new Error('Failed to add subscription');
      }

      alert('Subscription added successfully');
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
      const response = await fetch(`http://localhost:3003/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }

      alert('Subscription deleted successfully');
      displaySubscriptions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete subscription');
    }
  };

  // Función para agregar una deuda
  debtForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = 'example@example.com'; // Asegúrate de proporcionar el email correcto
    const creditor = document.getElementById('creditor').value;
    const amount = document.getElementById('debtAmount').value;
    const dueDate = document.getElementById('dueDate').value;
    const description = document.getElementById('debtDescription').value;

    try {
      const response = await fetch('http://localhost:3004/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, creditor, amount, dueDate, description })
      });

      if (!response.ok) {
        throw new Error('Failed to add debt');
      }

      alert('Debt added successfully');
      displayDebts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add debt');
    }
  });

  // Función para mostrar las deudas
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
              <button onclick="editDebt('${debt._id}', '${debt.creditor}', ${debt.amount}, '${new Date(debt.dueDate).toISOString().split('T')[0]}', '${debt.description}')">Edit</button>
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
      const response = await fetch(`http://localhost:3004/debts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete debt');
      }

      alert('Debt deleted successfully');
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
    document.getElementById('editDueDate').value = dueDate;
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
      const response = await fetch(`http://localhost:3004/debts/${id}`, {
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

      alert('Debt updated successfully');
      editDebtModal.style.display = 'none';
      displayDebts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update debt');
    }
  });

  // Función para obtener las categorías de presupuesto
  const displayBudgetCategories = async () => {
    try {
      const response = await fetch('http://localhost:3005/budget-categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve budget categories');
      }

      const data = await response.json();
      budgetCategoriesDiv.innerHTML = `
        <ul>
          ${data.map(category => `
            <li>
              ${category.category} - ${category.budget}
              <button onclick="editBudgetCategory('${category._id}', '${category.category}', ${category.budget})">Edit</button>
              <button onclick="deleteBudgetCategory('${category._id}')">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to retrieve budget categories');
    }
  };

  // Función para agregar una categoría de presupuesto
  budgetCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('category').value;
    const budget = document.getElementById('budget').value;

    try {
      const response = await fetch('http://localhost:3005/budget-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, budget })
      });

      if (!response.ok) {
        throw new Error('Failed to add budget category');
      }

      alert('Budget category added successfully');
      displayBudgetCategories();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add budget category');
    }
  });

  // Función para editar una categoría de presupuesto
  window.editBudgetCategory = (id, category, budget) => {
    document.getElementById('editBudgetCategoryId').value = id;
    document.getElementById('editCategory').value = category;
    document.getElementById('editBudget').value = budget;
    editBudgetCategoryModal.style.display = 'block';
  };

  editBudgetCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editBudgetCategoryId').value;
    const category = document.getElementById('editCategory').value;
    const budget = document.getElementById('editBudget').value;

    try {
      const response = await fetch(`http://localhost:3005/budget-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, budget })
      });

      if (!response.ok) {
        throw new Error('Failed to update budget category');
      }

      alert('Budget category updated successfully');
      editBudgetCategoryModal.style.display = 'none';
      displayBudgetCategories();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update budget category');
    }
  });

  // Función para eliminar una categoría de presupuesto
  window.deleteBudgetCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:3005/budget-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget category');
      }

      alert('Budget category deleted successfully');
      displayBudgetCategories();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete budget category');
    }
  };

  // Mostrar fuentes de dinero, metas de ahorro, transacciones, suscripciones, deudas y categorías de presupuesto al cargar la página
  displaySourcesAndGoals();
  displayTransactions();
  displaySubscriptions();
  displayDebts();
  displayBudgetCategories();
});
