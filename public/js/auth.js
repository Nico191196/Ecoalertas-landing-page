// js/auth.js
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
  } else {
    window.location.href = "index.html";
  }
});

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
