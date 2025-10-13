// js/registro-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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
  
  // Llama a la nueva función para llenar el menú de cargos
  cargarCargosDropdown();
});

// --- NUEVA FUNCIÓN para llenar el menú desplegable ---
async function cargarCargosDropdown() {
  const cargoSelect = document.getElementById('cargo-select');
  const cargosCollection = collection(db, 'cargo');
  const cargosSnapshot = await getDocs(cargosCollection);

  cargosSnapshot.forEach(doc => {
    const cargo = doc.data();
    const option = document.createElement('option');
    option.value = doc.id; 
    option.textContent = cargo.nombrecargo; 
    cargoSelect.appendChild(option);
  });
}

// --- FUNCIÓN DE REGISTRO  ---
async function handleRegister() {
  const nombre = document.getElementById('nombre-input').value;
  const apellido = document.getElementById('apellido-input').value;
  const rut = document.getElementById('rut-input').value;
  const cargoId = document.getElementById('cargo-select').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const messageEl = document.getElementById('message');

  if (!nombre || !apellido || !rut || !cargoId || !email || !password) {
    messageEl.textContent = "Error: Todos los campos son obligatorios.";
    messageEl.style.color = 'red';
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    
    const cargoRef = doc(db, "cargo", cargoId);

    
    const datosEmpleado = { nombre, apellido, rut, cargo: cargoRef, email };
    
    await setDoc(doc(db, "empleados", user.uid), datosEmpleado);
    
    messageEl.textContent = "¡Empleado registrado con éxito!";
    messageEl.style.color = 'green';
    document.querySelector('.login-form2').reset();

  } catch (error) {
    console.error("🔥 Error en el registro:", error);
    messageEl.textContent = "Error: " + error.message;
    messageEl.style.color = 'red';
  }
}
// --- LÓGICA PARA EL SLIDESHOW DEL FONDO ---
document.addEventListener('DOMContentLoaded', () => {
  // ... (tu código existente del loginBtn va aquí adentro) ...
  
  const slideshow = document.getElementById('background-slideshow');
  
  // Lista de tus imágenes. ¡Asegúrate de que las rutas sean correctas!
  const images = [
    '../IMG/fondo uno.avif',
    '../IMG/fondo2.jpeg',
    '../IMG/fondo3.jpg'
  ];

  let currentImageIndex = 0;

  // Carga todas las imágenes en el div
  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    if (index === 0) {
      img.classList.add('active'); // La primera imagen es visible al inicio
    }
    slideshow.appendChild(img);
  });

  // Cambia la imagen cada 5 segundos
  setInterval(() => {
    const allImages = slideshow.querySelectorAll('img');
    
    // Oculta la imagen actual
    allImages[currentImageIndex].classList.remove('active');
    
    // Calcula el índice de la siguiente imagen
    currentImageIndex = (currentImageIndex + 1) % images.length;
    
    // Muestra la siguiente imagen
    allImages[currentImageIndex].classList.add('active');

  }, 5000); // 5000 milisegundos = 5 segundos
});
