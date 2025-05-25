// js/main.js

// ——————————
// Modal de Login
// ——————————
const loginModal = document.getElementById('loginModal');
const loginBtn   = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
  loginModal.classList.add('active');
});

// Cerrar modal al hacer clic fuera del contenido
loginModal.addEventListener('click', e => {
  if (e.target === loginModal) {
    loginModal.classList.remove('active');
  }
});

// ——————————
// Manejo de Login con Firebase Auth
// ——————————
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email    = e.target.email.value.trim();
  const password = e.target.password.value;

  const spinner = e.target.querySelector('.loading-spinner');
  const textBtn = e.target.querySelector('.btn-text');

  spinner.classList.remove('hidden');
  textBtn.textContent = 'Iniciando...';

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Redirige al dashboard en la misma carpeta
      window.location.href = 'dashboard.html';
    })
    .catch(err => {
      alert('Error al iniciar sesión: ' + err.message);
    })
    .finally(() => {
      spinner.classList.add('hidden');
      textBtn.textContent = 'Iniciar Sesión';
    });
});

// ——————————
// Newsletter (simulado)
// ——————————
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  showNotification('¡Gracias por suscribirte!');
  e.target.reset();
});

// ——————————
// Toast Notification
// ——————————
function showNotification(msg) {
  const n = document.getElementById('notification');
  const t = document.getElementById('notificationText');
  t.textContent = msg;
  n.style.display = 'block';
  setTimeout(() => {
    n.style.display = 'none';
  }, 4000);
}

// ——————————
// Theme Toggle
// ——————————
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('darkMode', document.body.getAttribute('data-theme'));
});

// ——————————
// Restaurar tema guardado al cargar la página
// ——————————
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }
});
