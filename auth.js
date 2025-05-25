// js/auth.js
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
  } else {
    window.location.href = "index.html";
  }
});
auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = 'index.html';
  document.getElementById('userEmail').textContent = user.email;
});

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
