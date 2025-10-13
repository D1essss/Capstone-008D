// js/registro-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDocs , query, where} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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
  const rut = document.getElementById('rut-input').value; // Usaremos este valor
  const cargoId = document.getElementById('cargo-select').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const telefono = document.getElementById('telefono-input').value;
  const messageEl = document.getElementById('message');

  // Limpia el mensaje de error anterior
  messageEl.textContent = '';

  // --- PASO 1: Validación de campos vacíos (sin cambios) ---
  if (!nombre || !apellido || !rut || !cargoId || !email || !password || !telefono) {
    messageEl.textContent = "Error: Todos los campos son obligatorios.";
    messageEl.style.color = 'red';
    return;
  }

  // --- PASO 2: Nueva validación de formato y dígito verificador del RUT ---
  if (!validarRut(rut)) {
    messageEl.textContent = "Error: El RUT ingresado no es válido.";
    messageEl.style.color = 'red';
    return; // Detiene la ejecución si el RUT es inválido
  }

  // --- PASO 3: Nueva validación de RUT duplicado en Firestore ---
  try {
    const empleadosRef = collection(db, "empleados");
    const q = query(empleadosRef, where("rut", "==", rut));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      messageEl.textContent = "Error: El RUT ingresado ya está registrado en la base de datos.";
      messageEl.style.color = 'red';
      return; // Detiene la ejecución si el RUT ya existe
    }

    // --- Si todas las validaciones pasan, procedemos a registrar ---
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const cargoRef = doc(db, "cargo", cargoId);
    const datosEmpleado = { nombre, apellido, rut, cargo: cargoRef, email,telefono };

    await setDoc(doc(db, "empleados", user.uid), datosEmpleado);

    messageEl.textContent = "✅ ¡Empleado registrado con éxito!";
    messageEl.style.color = 'green';

    document.querySelector('.registration-form-grid').reset();

  } catch (error) {
    console.error("🔥 Error en el registro:", error);
    messageEl.textContent = "Error: " + error.message;
    messageEl.style.color = 'red';
  }
}
// --- FUNCIÓN PARA VALIDAR RUT CHILENO (ALGORITMO MÓDULO 11) ---
function validarRut(rutCompleto) {
  if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return false;
  
  const tmp = rutCompleto.split('-');
  let dv = tmp[1].toUpperCase();
  let cuerpo = tmp[0];
  
  let suma = 0;
  let multiplo = 2;
  
  // Recorrer el cuerpo del RUT de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * cuerpo.charAt(i);
    if (multiplo < 7) {
      multiplo++;
    } else {
      multiplo = 2;
    }
  }
  
  const dvEsperado = 11 - (suma % 11);
  
  if (dvEsperado == 10) {
    dv = 'K';
  } else if (dvEsperado == 11) {
    dv = '0';
  } else {
    dv = dvEsperado.toString();
  }
  
  return dv == tmp[1].toUpperCase();
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
