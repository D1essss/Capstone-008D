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





// --- FUNCIÓN PARA MOSTRAR LOS PRODUCTOS ---

async function mostrarProductos() {
  const tableBody = document.getElementById('product-table-body');
  tableBody.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "producto"));
    
    // Cambiamos forEach por un bucle for...of para usar await adentro
    for (const productoDoc of querySnapshot.docs) {
      const producto = productoDoc.data();
      let categoriaNombre = "Sin categoría"; 
      if (producto.categoria) {
        const categoriaDoc = await getDoc(producto.categoria);
        if (categoriaDoc.exists()) {
          categoriaNombre = categoriaDoc.data().nombrecategoria;
        }
      }

      const row = document.createElement('tr');
      let fechaLegible = "No disponible";
      if (producto.fechaingreso && typeof producto.fechaingreso.toDate === 'function') {
        fechaLegible = producto.fechaingreso.toDate().toLocaleString();
      }

      row.innerHTML = `
        <td>${producto.nombreproducto}</td>
        <td>${producto.stock}</td>
        <td>$${producto.precio}</td>
        <td>${fechaLegible}</td>
        <td>${categoriaNombre}</td> 
      `;
      tableBody.appendChild(row);
    }

  } catch (error) {
    console.error("🔥 Error al obtener los productos:", error);
  }
}

// Llama a la función para que se ejecute
mostrarProductos();

// --- NUEVA FUNCIÓN PARA MOSTRAR EL HISTORIAL DE MOVIMIENTOS ---
async function mostrarRegistros() {
  const tableBody = document.getElementById('registro-table-body');
  tableBody.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "registro")); // Cambiado a 'registro'

    for (const registroDoc of querySnapshot.docs) {
      const registro = registroDoc.data();
      
      // Variables para guardar los nombres de las referencias
      let nombreProducto = "Producto no encontrado";
      let nombreResponsable = "Responsable no encontrado";
      
      // 1. Obtener el nombre del producto desde la referencia
      if (registro.codigo) { // Asumiendo que 'codigo' es la referencia al producto
        const productoDoc = await getDoc(registro.codigo);
        if (productoDoc.exists()) {
          nombreProducto = productoDoc.data().nombreproducto;
        }
      }

      // 2. Obtener el nombre del responsable desde la referencia
      if (registro.responsable) {
        const responsableDoc = await getDoc(registro.responsable);
        if (responsableDoc.exists()) {
          const respData = responsableDoc.data();
          nombreResponsable = `${respData.nombre} ${respData.apellido}`;
        }
      }

      const row = document.createElement('tr');
      // Usamos fsalidabodega como la fecha principal del movimiento
      let fechaSalida = "No disponible";
      if (registro.fsalidabodega && typeof registro.fsalidabodega.toDate === 'function') {
          fechaSalida = registro.fsalidabodega.toDate().toLocaleString();
      }

      row.innerHTML = `
        <td>${nombreProducto}</td>
        <td>${nombreResponsable}</td>
        <td>Salida</td> <td>${registro.lote || 'N/A'}</td> <td>${fechaSalida}</td>
      `;
      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error("🔥 Error al obtener los registros:", error);
  }
}


// --- LÓGICA PARA MANEJAR LAS PESTAÑAS ---
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = document.querySelector("#" + tab.dataset.tab);

      // Ocultar todo el contenido
      tabContents.forEach(content => {
        content.classList.remove('is-active');
      });
      // Quitar la clase activa de todos los botones
      tabs.forEach(t => {
        t.classList.remove('is-active');
      });

      // Mostrar el contenido y marcar el botón como activo
      target.classList.add('is-active');
      tab.classList.add('is-active');
    });
  });

  // Cargar los datos de ambas tablas al iniciar la página
  mostrarRegistros();
});

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
// en js/renderer.js

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

