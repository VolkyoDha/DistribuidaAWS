document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert('User registered successfully');
    window.location.href = '/login.html'; // Redirige al usuario a la página de inicio de sesión
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
});