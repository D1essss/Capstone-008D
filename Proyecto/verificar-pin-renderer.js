// En verificar-pin-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Copia tu firebaseConfig de cualquier otro script
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

// --- Función para manejar la verificación ---
async function handlePinVerification() {
  const pinInput = document.getElementById('pin-input');
  const pin = pinInput.value;
  const errorMessage = document.getElementById('error-message');
  const uidToVerify = sessionStorage.getItem('uidFor2FA'); // Obtenemos el UID temporal

  if (!uidToVerify) {
    // Si no hay UID, algo salió mal. Enviar de vuelta al login.
    window.electronAPI.navigate('iniciosesion.html');
    return;
  }
  
  if (pin.length !== 6) {
    errorMessage.textContent = 'El PIN debe tener 6 dígitos.';
    return;
  }

  try {
    // Consultamos Firestore por el PIN real
    const userRef = doc(db, "empleados", uidToVerify);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().securityPin === pin) {
      // ¡ÉXITO! El PIN es correcto.
      
      // 1. Promovemos el UID temporal a un UID de sesión real
      sessionStorage.setItem('loggedInUserUid', uidToVerify);
      
      // 2. Limpiamos el UID temporal
      sessionStorage.removeItem('uidFor2FA');
      
      // 3. Enviamos al usuario a la app
      window.electronAPI.navigate('index.html');

    } else {
      // FRACASO: El PIN es incorrecto
      errorMessage.textContent = 'PIN incorrecto. Inténtalo de nuevo.';
      pinInput.value = ''; // Limpiamos el campo
    }

  } catch (error) {
    console.error("Error al verificar el PIN:", error);
    errorMessage.textContent = 'Error al consultar la base de datos.';
  }
}

// --- Función para cancelar y volver al login ---
function cancelLogin() {
  // Limpiamos cualquier UID temporal antes de volver
  sessionStorage.removeItem('uidFor2FA');
  window.electronAPI.navigate('iniciosesion.html');
}

// --- Listeners de la página ---
document.addEventListener('DOMContentLoaded', () => {
  const verifyPinBtn = document.getElementById('verifyPinBtn');
  const cancelLoginBtn = document.getElementById('cancelLoginBtn');
  const pinInput = document.getElementById('pin-input');

  // Guardia de seguridad: si no hay un UID para verificar, volver al login.
  if (!sessionStorage.getItem('uidFor2FA')) {
    window.electronAPI.navigate('iniciosesion.html');
  }

  if (verifyPinBtn) {
    verifyPinBtn.addEventListener('click', handlePinVerification);
  }
  
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', cancelLogin);
  }
  
  // Opcional: Permitir presionar Enter para verificar
  if (pinInput) {
    pinInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        handlePinVerification();
      }
    });
  }
});