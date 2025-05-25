// js/main.js

// Modal de Login
const loginModal = document.getElementById('loginModal');
document.getElementById('loginBtn').onclick = () => loginModal.classList.add('active');
loginModal.onclick = e => { if (e.target === loginModal) loginModal.classList.remove('active'); };

// Manejo de Login con Firebase
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const spinner = e.target.querySelector('.loading-spinner');
  const text = e.target.querySelector('.btn-text');

  spinner.classList.remove('hidden');
  text.textContent = 'Iniciando...';

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = 'dashboard.html')
    .catch(err => showNotification('Error: ' + err.message))
    .finally(() => {
      spinner.classList.add('hidden');
      text.textContent = 'Iniciar Sesión';
    });
});

// Newsletter
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  showNotification('Gracias por suscribirte.');
  e.target.reset();
});

// Notificaciones Toast
function showNotification(msg) {
  const n = document.getElementById('notification');
  const t = document.getElementById('notificationText');
  t.textContent = msg;
  n.style.display = 'block';
  setTimeout(() => n.style.display = 'none', 4000);
}

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
  const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('darkMode', theme);
});

// Al iniciar la app, restablecer tema
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'dark') document.body.setAttribute('data-theme', 'dark');
});
