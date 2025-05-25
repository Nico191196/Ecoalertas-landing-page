// js/auth.js

// Escucha cambios en el estado de autenticación
auth.onAuthStateChanged(user => {
  if (!user) {
    // Si no hay usuario autenticado, redirige al inicio
    window.location.href = 'index.html';
  } else {
    // Si hay usuario, muestra su correo en el dashboard
    const emailEl = document.getElementById('userEmail');
    if (emailEl) {
      emailEl.textContent = user.email;
    }
  }
});
