// js/renderer.js

console.log("Paso 1: renderer.js se está ejecutando...");

// Importa las funciones que necesitas de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc,query,where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword,sendPasswordResetEmail,signOut} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
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
let allProducts = []; // Para guardar todos los productos de Firestore
let filteredProducts = []; // Para guardar los productos después de aplicar el filtro de categoría
// --- FUNCIÓN PARA CARGAR LAS CATEGORÍAS EN EL FILTRO SELECT (Sin cambios) ---
async function cargarCategoriasEnFiltro() {
  const categoryFilter = document.getElementById('category-filter');
  categoryFilter.innerHTML = '<option value="all" selected>Todas las categorías</option>'; 

  try {
    const categoriasSnapshot = await getDocs(collection(db, "categoria"));
    categoriasSnapshot.forEach(doc => {
      const categoria = doc.data();
      const option = document.createElement('option');
      option.value = doc.id; 
      option.textContent = categoria.nombrecategoria;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error("🔥 Error al cargar categorías en el filtro:", error);
  }
}
// --- FUNCIÓN CENTRAL PARA CARGAR DATOS DE PRODUCTOS DESDE FIRESTORE ---
async function fetchProductsFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "producto"));
        allProducts = []; // Limpiamos el array antes de rellenar

        for (const productoDoc of querySnapshot.docs) {
            const producto = productoDoc.data();
            producto.id = productoDoc.id; // Guarda el ID del documento
            let categoriaNombre = "Sin categoría";

            if (producto.categoria) {
                const categoriaDoc = await getDoc(producto.categoria);
                if (categoriaDoc.exists()) {
                    categoriaNombre = categoriaDoc.data().nombrecategoria;
                } else {
                    categoriaNombre = "Categoría no encontrada";
                }
            }
            producto.categoriaNombre = categoriaNombre; // Añade el nombre de la categoría al objeto producto
            allProducts.push(producto);
        }
        applyCategoryFilterAndRender(); // Al cargar todos, aplica el filtro inicial y renderiza
    } catch (error) {
        console.error("🔥 Error al obtener los productos desde Firestore:", error);
    }
}
// --- FUNCIÓN PARA APLICAR FILTRO DE CATEGORÍA Y BUSQUEDA Y RENDERIZAR LA TABLA ---
function applyCategoryFilterAndRender() {
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategoryId = categoryFilter ? categoryFilter.value : 'all';
    const searchTerm = document.getElementById('buscador') ? document.getElementById('buscador').value.toLowerCase() : '';

    filteredProducts = allProducts.filter(producto => {
        // --- CAMBIO CLAVE AQUÍ ---
        // Accedemos a producto.categoria.id de forma segura si producto.categoria existe
        const productoCategoriaId = producto.categoria ? producto.categoria.id : null; 
        
        const matchesCategory = (selectedCategoryId === 'all' || (productoCategoriaId === selectedCategoryId));
        const matchesSearch = producto.nombreproducto.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    renderProductTable(filteredProducts);
}
// --- FUNCIÓN PARA RENDERIZAR LA TABLA (Genera el HTML de la tabla) ---
function renderProductTable(productsToRender) {
  const tableBody = document.getElementById('product-table-body');
  tableBody.innerHTML = ''; // Limpiamos la tabla antes de renderizar

  productsToRender.forEach(producto => {
    const row = document.createElement('tr');
    row.classList.add('fila-producto'); // Para la búsqueda
    
    let fechaLegible = "No disponible";
    if (producto.fechaingreso && typeof producto.fechaingreso.toDate === 'function') {
      fechaLegible = producto.fechaingreso.toDate().toLocaleString();
    }

    row.innerHTML = `
      <td class="nombre-producto">${producto.nombreproducto}</td>
      <td>${producto.stock}</td>
      <td>$${producto.precio}</td>
      <td>${fechaLegible}</td>
      <td>${producto.categoriaNombre}</td> 
    `;
    tableBody.appendChild(row);
  });
}
async function mostrarRegistros() {
  const tableBody = document.getElementById('registro-table-body');
  tableBody.innerHTML = ''; // Limpiamos la tabla antes de añadir nuevos datos

  try {
    // Apuntamos a la colección 'registros'
    const querySnapshot = await getDocs(collection(db, "registro")); 

    for (const registroDoc of querySnapshot.docs) {
      const registro = registroDoc.data();
      
      let nombreProducto = registro.nombreproducto || "N/A";
      let nombreResponsable = registro.ingresadoPor || "N/A"; // Ahora es un string directo
      let tipoMovimiento = "Desconocido";
      let fechaMovimiento = "No disponible";
      let cantidadMovida = registro.stock || 0; // Usaremos 'stock' como la cantidad movida
      let ubicacion = registro.numeroEstante || "N/A"; // Nuevo campo para la ubicación

     // Determinar el tipo de movimiento y la fecha relevante de forma segura
      if (registro.fecha_salida && typeof registro.fecha_salida === 'object' && typeof registro.fecha_salida.toDate === 'function') {
        tipoMovimiento = "Salida";
        fechaMovimiento = registro.fecha_salida.toDate().toLocaleString();
      } else if (registro.fecha_ingreso && typeof registro.fecha_ingreso === 'object' && typeof registro.fecha_ingreso.toDate === 'function') {
        tipoMovimiento = "Entrada";
        fechaMovimiento = registro.fecha_ingreso.toDate().toLocaleString();
      } else {
          // Si ninguna fecha es válida o no existe
          fechaMovimiento = "Fecha inválida";
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${nombreProducto}</td>
        <td>${nombreResponsable}</td>
        <td>${tipoMovimiento}</td> 
        <td>${cantidadMovida}</td> 
        <td>${fechaMovimiento}</td>
        <td>${ubicacion}</td> `;
      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error("🔥 Error al obtener los registros:", error);
  }
}

// --- LÓGICA PARA MANEJAR LAS PESTAÑAS Y FILTROS ---
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const categoryFilter = document.getElementById('category-filter');
  const applyFilterBtn = document.getElementById('apply-filter-btn');
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  const buscadorInput = document.getElementById('buscador'); // Obtener el input de búsqueda

  // Event Listeners para las pestañas
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = document.querySelector("#" + tab.dataset.tab);

      tabContents.forEach(content => { content.classList.remove('is-active'); });
      tabs.forEach(t => { t.classList.remove('is-active'); });

      target.classList.add('is-active');
      tab.classList.add('is-active');

      // Al cambiar de pestaña, recalcular el filtro y la búsqueda
      if (tab.dataset.tab === 'inventario') {
          applyCategoryFilterAndRender(); // Ahora también aplica la búsqueda
      } else if (tab.dataset.tab === 'historial') {
          mostrarRegistros();
      }
    });
  });

  // Event Listeners para los filtros de categoría
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', () => {
      applyCategoryFilterAndRender();
    });
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      if (categoryFilter) categoryFilter.value = 'all'; // Restablecer el select a "Todas"
      if (buscadorInput) buscadorInput.value = ''; // Limpiar la búsqueda
      applyCategoryFilterAndRender(); // Mostrar todos los productos sin filtro/búsqueda
    });
  }

  // Event Listener para el buscador
  if (buscadorInput) {
    buscadorInput.addEventListener('keyup', () => {
      applyCategoryFilterAndRender(); // Aplica el filtro de búsqueda dinámicamente
    });
  }


  // Cargar categorías y productos al iniciar
  cargarCategoriasEnFiltro();
  fetchProductsFromFirestore(); // Carga todos los productos de Firestore
  mostrarRegistros(); // Carga los registros (se renderizarán solo si esa pestaña está activa)
});



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


async function handleLogin() {
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const errorMessage = document.getElementById('error-message'); 

  const email = emailInput.value;
  const password = passwordInput.value;


  errorMessage.textContent = '';

 
  if (!email || !password) {
    errorMessage.textContent = "Por favor, ingresa tu correo y contraseña.";
    return; 
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRef = doc(db, "empleados", user.uid);
    const userSnap = await getDoc(userRef);
    const empleadoRef = doc(db, "empleados", user.uid);
    const empleadoSnap = await getDoc(empleadoRef);
    if (empleadoSnap.exists()) {
          const empleadoData = empleadoSnap.data();
          let nombreCargo = "";

          if (empleadoData.cargo && typeof empleadoData.cargo === 'object' && empleadoData.cargo.path) {
             const cargoSnap = await getDoc(empleadoData.cargo);
             if (cargoSnap.exists()) nombreCargo = cargoSnap.data().nombrecargo || "";
          } else if (typeof empleadoData.cargo === 'string') {
             nombreCargo = empleadoData.cargo;
          }

          // Bloquear si es Reponedor
          if (nombreCargo && nombreCargo.toLowerCase().trim() === "reponedor") {
              await signOut(auth); 
              errorMessage.textContent = "Acceso denegado: Los reponedores solo pueden usar la App Móvil.";
              errorMessage.style.color = "red";
              return;
          }
           sessionStorage.setItem('userRole', nombreCargo);
      }
      

    if (userSnap.exists() && userSnap.data().securityPin) {
      sessionStorage.setItem('uidFor2FA', user.uid);
      
      window.electronAPI.navigate('verificar-pin.html');

    } else {
      sessionStorage.setItem('loggedInUserUid', user.uid);
      console.log("✅ Inicio de sesión exitoso (sin PIN):", user.uid);
      window.electronAPI.navigate('index.html');
    }
}
catch (error) {
    console.error("🔥 Error al iniciar sesión:", error);
}errorMessage.textContent = 'Correo o contraseña incorrectos.';
}
// --- INICIO DE CÓDIGO AÑADIDO PARA RESETEO ---

// 1. Obtener todos los nuevos elementos
const loginForm = document.getElementById('loginForm');
const resetForm = document.getElementById('resetForm');

const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const resetBtn = document.getElementById('resetBtn');
const resetEmailInput = document.getElementById('reset-email-input');
const resetMessage = document.getElementById('reset-message');
const errorMessage = document.getElementById('error-message'); // Ya deberías tenerla

// 2. Listener para mostrar el formulario de reseteo
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace recargue la página
        loginForm.style.display = 'none';
        resetForm.style.display = 'block';
        errorMessage.textContent = ''; // Limpia errores antiguos
    });
}

// 3. Listener para volver al login
if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetForm.style.display = 'none';
        loginForm.style.display = 'block';
        resetMessage.textContent = ''; // Limpia mensajes antiguos
    });
}

// 4. Listener para el botón de enviar enlace
if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
        const email = resetEmailInput.value;

        if (!email) {
            resetMessage.textContent = "Por favor, ingresa tu correo.";
            resetMessage.style.color = 'var(--danger-color)'; // Usará tu CSS
            return;
        }

        // Desactivar botón mientras se envía
        resetBtn.disabled = true;
        resetBtn.textContent = "Enviando...";
        resetMessage.textContent = '';

        try {
            // La función de Firebase para enviar el correo
            await sendPasswordResetEmail(auth, email);
            
            resetMessage.textContent = "¡Correo enviado! Revisa tu bandeja de entrada (y spam).";
            resetMessage.style.color = 'var(--status-en-stock-text)'; // Color verde de tu CSS
            resetEmailInput.disabled = true;
            resetBtn.style.display = 'none'; // Oculta el botón
            backToLoginLink.textContent = "Volver"; // Cambia el texto del enlace de volver

        } catch (error) {
            console.error("Error al enviar correo de reseteo:", error);
            if (error.code === 'auth/user-not-found') {
                resetMessage.textContent = "No existe cuenta registrada con ese correo.";
            } else {
                resetMessage.textContent = "Error al enviar el correo. Intenta de nuevo.";
            }
            resetMessage.style.color = 'var(--danger-color)';
            
            // Reactivar botón si falla
            resetBtn.disabled = false;
            resetBtn.textContent = "Enviar Enlace";
        }
    });
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

// js/renderer.js - BUSCADOR

document.getElementById("buscador").addEventListener("keyup", function() {
  let textoBusqueda = this.value.toLowerCase();
  
  // Ahora buscamos por las filas de la tabla
  let filas = document.querySelectorAll(".fila-producto"); 

  filas.forEach(function(fila) {
    // Obtenemos el texto del nombre del producto en esa fila
    let nombreProducto = fila.querySelector(".nombre-producto").textContent.toLowerCase();

    if (nombreProducto.includes(textoBusqueda)) {
      fila.style.display = ""; // Muestra la fila
    } else {
      fila.style.display = "none"; // Oculta la fila
    }
  });
});
  if (document.getElementById('product-table-body')) {
        const btnRegistrar = document.getElementById('btn-registrar-empleado');
        const userRole = sessionStorage.getItem('userRole'); 
        console.log("Rol detectado en Dashboard:", userRole);

        if (btnRegistrar) {
            if (!userRole || userRole.toLowerCase().trim() !== 'supervisor') {
                btnRegistrar.style.display = 'none'; 
            } else {
                btnRegistrar.style.display = 'block'; 
            }
        }
    }

