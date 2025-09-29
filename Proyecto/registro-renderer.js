// js/registro-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBe_hG10cUc44ISvAEzDRl8kzDneC8JTfk",
  authDomain: "qrdendb.firebaseapp.com",
  projectId: "qrdendb",
  storageBucket: "qrdendb.firebasestorage.app",
  messagingSenderId: "911523405763",
  appId: "1:911523405763:web:58296a6b644d4386f6a776",
  measurementId: "G-LM4YSMR09F"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Lógica de la Página de Registro ---
document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('registerBtn');
  registerBtn.addEventListener('click', handleRegister);
});

async function handleRegister() {
  // Obtener los valores de los inputs
  const nombre = document.getElementById('nombre-input').value;
  const apellido = document.getElementById('apellido-input').value;
  const cargo = document.getElementById('cargo-input').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const messageEl = document.getElementById('message');

  // Validar que los campos no estén vacíos
  if (!nombre || !apellido || !cargo || !email || !password) {
    messageEl.textContent = "Error: Todos los campos son obligatorios.";
    messageEl.style.color = 'red';
    return;
  }

  try {
    // --- PASO 1: Crear usuario en Authentication ---
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // --- PASO 2: Crear documento en Firestore ---
    const datosAdicionales = { nombre, apellido, cargo, email };
    await setDoc(doc(db, "empleados", user.uid), datosAdicionales);
    
    messageEl.textContent = "¡Empleado registrado con éxito!";
    messageEl.style.color = 'green';

  } catch (error) {
    console.error("🔥 Error en el registro:", error);
    messageEl.textContent = "Error: " + error.message;
    messageEl.style.color = 'red';
  }
}