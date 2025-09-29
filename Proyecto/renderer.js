// js/renderer.js

console.log("Paso 1: renderer.js se está ejecutando...");

// Importa las funciones que necesitas de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {  createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// TODO: Asegúrate de que tu firebaseConfig está aquí y es correcto
const firebaseConfig = {
  apiKey: "AIzaSyBe_hG10cUc44ISvAEzDRl8kzDneC8JTfk",
  authDomain: "qrdendb.firebaseapp.com",
  projectId: "qrdendb",
  storageBucket: "qrdendb.firebasestorage.app",
  messagingSenderId: "911523405763",
  appId: "1:911523405763:web:58296a6b644d4386f6a776",
  measurementId: "G-LM4YSMR09F"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Paso 2: Firebase se ha inicializado correctamente.");

// Función para verificar la conexión leyendo un dato existente
async function verificarConexion() {
  try {
    const docRef = doc(db, "trabajador", "trabajador");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("✅ ¡Conexión exitosa! Datos recibidos:", docSnap.data());
    } else {
      console.log("❌ Conexión a Firebase correcta, pero no se encontró el documento.");
    }
  } catch (error) {
    console.error("🔥 Error de conexión a Firebase:", error);
  }
}

// Llama a la función para que se ejecute
verificarConexion();

// Funcion de inicio de sesion
const auth = getAuth(app); // Obtiene una referencia al servicio de autenticación
// Se ejecuta cuando el HTML ha cargado completamente
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin); // Llama a la función handleLogin al hacer clic
  }
});


// --- FUNCIÓN PARA MANEJAR EL INICIO DE SESIÓN ---
// js/renderer.js

// js/renderer.js

async function handleLogin() {
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const errorMessage = document.getElementById('error-message'); // Obtenemos el párrafo de error

  const email = emailInput.value;
  const password = passwordInput.value;

  // Limpia cualquier mensaje de error anterior
  errorMessage.textContent = '';

  // 1. Validar campos vacíos y mostrar error en el párrafo
  if (!email || !password) {
    errorMessage.textContent = "Por favor, ingresa tu correo y contraseña.";
    return; // Detiene la función
  }

  // 2. Intentar iniciar sesión
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log("✅ Inicio de sesión exitoso:", userCredential.user.uid);
    window.electronAPI.navigate('index.html');

  } catch (error) {
    console.error("🔥 Error al iniciar sesión:", error.message);
    // 3. Mostrar error de credenciales en el párrafo
    errorMessage.textContent = "Correo o contraseña incorrectos.";
  }
}





// --- FUNCIÓN PARA MOSTRAR LOS PRODUCTOS ---
// en js/renderer.js

async function mostrarProductos() {
  const tableBody = document.getElementById('product-table-body');
  tableBody.innerHTML = ''; // Limpia la tabla antes de llenarla

  try {
    const querySnapshot = await getDocs(collection(db, "producto"));
    
    querySnapshot.forEach((doc) => {
      const producto = doc.data();

      // 1. Crea una nueva fila <tr>
      const row = document.createElement('tr');

      // 2. Formatea la fecha de forma segura
      let fechaLegible = "No disponible";
      if (producto.fechaingreso && typeof producto.fechaingreso.toDate === 'function') {
        fechaLegible = producto.fechaingreso.toDate().toLocaleString();
      }

      // 3. Crea una celda <td> para cada dato y añádela a la fila
      row.innerHTML = `
        <td>${producto.nombreproducto}</td>
        <td>${producto.stock}</td>
        <td>$${producto.precio}</td>
        <td>${fechaLegible}</td>
        <td>${producto.categoria}</td>
      `;

      // 4. Añade la fila completa al cuerpo de la tabla
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("🔥 Error al obtener los productos:", error);
  }
}

// Llama a la función para que se ejecute
mostrarProductos();

// --- FUNCIÓN MEJORADA PARA CREAR USUARIO Y PERFIL ---
async function crearUsuario(email, password, datosAdicionales) {
  try {
    // --- PASO 1: Crear el usuario en Authentication ---
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ Usuario creado en Authentication con UID:", user.uid);

    // --- PASO 2: Usar el UID para crear el documento en Firestore ---
    // La referencia al documento ahora usa el UID del usuario como su ID
    await setDoc(doc(db, "empleados", user.uid), {
      nombre: datosAdicionales.nombre,
      apellido: datosAdicionales.apellido,
      cargo: datosAdicionales.cargo,
      email: email // Guardamos el email también para fácil acceso
    });
    
    console.log("📄 Perfil de empleado creado en Firestore.");

  } catch (error) {
    console.error("🔥 Error en el registro completo:", error);
  }
}

