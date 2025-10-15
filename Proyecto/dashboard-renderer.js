// js/dashboard-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBe_hG10cUc44ISvAEzDRl8kzDneC8JTfk",
  authDomain: "qrdendb.firebaseapp.com",
  projectId: "qrdendb",
  storageBucket: "qrdendb.firebasestorage.app",
  messagingSenderId: "911523405763",
  appId: "1:911523405763:web:58296a6b644d4386f6a776",
  measurementId: "G-LM4YSMR09F"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNCIÓN PRINCIPAL PARA OBTENER Y PROCESAR DATOS ---
async function cargarDatosParaGraficos() {
  try {
    const querySnapshot = await getDocs(collection(db, "registro"));
    const registros = querySnapshot.docs.map(doc => doc.data());

    if (registros.length === 0) {
      console.log("No hay registros para generar gráficos.");
      return;
    }

    generarGraficoTopProductos(registros);
    generarGraficoEntradasSalidas(registros);
    generarGraficoEmpleados(registros); // Nueva llamada
    generarGraficoMovimientosDiarios(registros); // Nueva llamada

  } catch (error) {
    console.error("🔥 Error al cargar datos para los gráficos:", error);
  }
}

// --- FUNCIÓN PARA EL GRÁFICO DE TOP 5 PRODUCTOS ---
function generarGraficoTopProductos(registros) {
  const ctx = document.getElementById('topProductsChart');
  if (!ctx) return;

  // 1. Contar las unidades movidas por producto
  const productMovements = {};
  registros.forEach(reg => {
    const productName = reg.nombreproducto;
    const quantity = reg.stock || 0; // Usamos 'stock' como la cantidad movida

    if (productMovements[productName]) {
      productMovements[productName] += quantity;
    } else {
      productMovements[productName] = quantity;
    }
  });

  // 2. Ordenar y obtener el top 5
  const sortedProducts = Object.entries(productMovements)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const labels = sortedProducts.map(item => item[0]); // Nombres de productos
  const data = sortedProducts.map(item => item[1]);   // Cantidades

  // 3. Crear el gráfico
  new Chart(ctx, {
    type: 'bar', // Tipo de gráfico: barras
    data: {
      labels: labels,
      datasets: [{
        label: 'Unidades Movidas',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --- FUNCIÓN PARA EL GRÁFICO DE ENTRADAS VS. SALIDAS ---
function generarGraficoEntradasSalidas(registros) {
  const ctx = document.getElementById('entryExitChart');
  if (!ctx) return;

  // 1. Contar entradas y salidas
  let entradas = 0;
  let salidas = 0;
  registros.forEach(reg => {
    if (reg.fecha_salida) {
      salidas++;
    } else if (reg.fecha_ingreso) {
      entradas++;
    }
  });

  // 2. Crear el gráfico
  new Chart(ctx, {
    type: 'doughnut', // Tipo de gráfico: donut
    data: {
      labels: ['Salidas', 'Entradas'],
      datasets: [{
        label: 'Tipo de Movimiento',
        data: [salidas, entradas],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Rojo para salidas
          'rgba(75, 192, 192, 0.6)'  // Verde para entradas
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --- INICIAR TODO CUANDO LA PÁGINA CARGUE ---
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosParaGraficos();
});
// --- FUNCIÓN PARA EL GRÁFICO DE TOP EMPLEADO POR MOVIMIENTOS ---
function generarGraficoEmpleados(registros) {
  const ctx = document.getElementById('employeeMovementsChart');
  if (!ctx) return;

  const employeeMovements = {};
  registros.forEach(reg => {
    const responsable = reg.ingresadoPor || 'Desconocido';
    if (employeeMovements[responsable]) {
      employeeMovements[responsable]++;
    } else {
      employeeMovements[responsable] = 1;
    }
  });

  const sortedEmployees = Object.entries(employeeMovements)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 empleados

  const labels = sortedEmployees.map(item => item[0]);
  const data = sortedEmployees.map(item => item[1]);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Movimientos',
        data: data,
        backgroundColor: 'rgba(153, 102, 255, 0.6)', // Púrpura
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --- FUNCIÓN PARA EL GRÁFICO DE MOVIMIENTO DE PRODUCTOS POR DÍA ---
function generarGraficoMovimientosDiarios(registros) {
  const ctx = document.getElementById('dailyMovementsChart');
  if (!ctx) return;

  const dailyMovements = {};

  registros.forEach(reg => {
    let date = null;
    if (reg.fecha_salida && typeof reg.fecha_salida.toDate === 'function') {
      date = reg.fecha_salida.toDate();
    } else if (reg.fecha_ingreso && typeof reg.fecha_ingreso.toDate === 'function') {
      date = reg.fecha_ingreso.toDate();
    }

    if (date) {
      // Formatear la fecha a 'YYYY-MM-DD' para agrupar por día
      const dateKey = date.toISOString().split('T')[0];
      const quantity = reg.stock || 0; // Asumimos 'stock' es la cantidad movida

      if (dailyMovements[dateKey]) {
        dailyMovements[dateKey] += quantity;
      } else {
        dailyMovements[dateKey] = quantity;
      }
    }
  });

  // Ordenar las fechas cronológicamente
  const sortedDates = Object.keys(dailyMovements).sort();
  const labels = sortedDates;
  const data = sortedDates.map(date => dailyMovements[date]);

  new Chart(ctx, {
    type: 'line', // Tipo de gráfico: líneas
    data: {
      labels: labels,
      datasets: [{
        label: 'Unidades Movidas por Día',
        data: data,
        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Naranja
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        fill: false, // No rellenar bajo la línea
        tension: 0.1 // Suaviza la línea
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Unidades'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}