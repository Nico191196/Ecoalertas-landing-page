// js/dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  fetchStats().then(stats => {
    document.getElementById('totalAlerts').textContent = stats.total;
    document.getElementById('activeCities').textContent = stats.cities;
    document.getElementById('averageResponse').textContent = stats.avgResponse;
  });

  fetchAlerts().then(data => {
    const tbody = document.querySelector('#alertsTable tbody');
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
  });
});

function exportToExcel() {
  const table = document.getElementById('alertsTable');
  const wb = XLSX.utils.table_to_book(table, { sheet: "Alertas" });
  XLSX.writeFile(wb, "ecoalertas.xlsx");
}
