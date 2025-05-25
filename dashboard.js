// js/dashboard.js

// Protege la página y carga datos solo tras autenticación
auth.onAuthStateChanged(user => {
  if (!user) {
    // Si no hay sesión activa, vuelve al índice
    window.location.href = 'index.html';
    return;
  }

  // Muestra el email del usuario en el dashboard
  const emailEl = document.getElementById('userEmail');
  if (emailEl) {
    emailEl.textContent = user.email;
  }

  // Carga y muestra estadísticas
  fetchStats()
    .then(stats => {
      document.getElementById('totalAlerts').textContent  = stats.total;
      document.getElementById('activeCities').textContent = stats.cities;
      document.getElementById('avgResponse').textContent  = stats.avgResponse;
    })
    .catch(err => {
      console.error('Error cargando stats:', err);
    });

  // Carga y muestra el listado de alertas
  fetchAlerts()
    .then(data => {
      const tbody = document.querySelector('#alertsTable tbody');
      tbody.innerHTML = ''; // limpia cualquier contenido previo
      data.forEach(alert => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${alert.date}</td>
          <td>${alert.type}</td>
          <td>${alert.location}</td>
          <td>${alert.status}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error('Error cargando alerts:', err);
    });
});

// Función para exportar a Excel
function exportToExcel() {
  const table = document.getElementById('alertsTable');
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Alertas' });
  XLSX.writeFile(wb, 'ecoalertas.xlsx');
}
