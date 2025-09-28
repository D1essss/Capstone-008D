// js/renderer.js

console.log("Paso 1: renderer.js se está ejecutando...");

// Importa las funciones que necesitas de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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