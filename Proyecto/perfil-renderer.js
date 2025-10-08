// js/perfil-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
const auth = getAuth(app);

// --- FUNCIÓN PARA CARGAR LOS DATOS DEL PERFIL ---
async function cargarDatosPerfil(uid) {
  try {
    // 1. Obtener el documento del empleado usando su UID
    const empleadoRef = doc(db, "empleados", uid); 
    const empleadoSnap = await getDoc(empleadoRef);

    if (empleadoSnap.exists()) {
      const empleadoData = empleadoSnap.data();
      let nombrecargo = "No asignado";

      // 2. Obtener el nombre del cargo desde la referencia
      if (empleadoData.cargo) {
        const cargoSnap = await getDoc(empleadoData.cargo);
        if (cargoSnap.exists()) {
          nombrecargo = cargoSnap.data().nombrecargo;
        }
      }

      // 3. Poblar el HTML con los datos
      document.getElementById('user-name').textContent = `${empleadoData.nombre} ${empleadoData.apellido}`;
      document.getElementById('user-role').textContent = nombrecargo;
      document.getElementById('user-email').textContent = empleadoData.email;
      document.getElementById('user-rut').textContent = empleadoData.rut;
      document.getElementById('user-phone').textContent = empleadoData.telefono;
      
    } else {
      console.log("No se encontró un perfil para este usuario.");
    }
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  }
}

// --- VERIFICAR ESTADO DE AUTENTICACIÓN ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si el usuario ha iniciado sesión, obtenemos su UID y cargamos sus datos
    console.log("Usuario autenticado:", user.uid);
    cargarDatosPerfil(user.uid);
  } else {
    // Si no hay usuario, podríamos redirigirlo al login
    console.log("Ningún usuario ha iniciado sesión.");
    // window.electronAPI.navigate('iniciosesion.html'); // Opcional
  }
});