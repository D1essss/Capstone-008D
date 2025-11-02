// js/perfil-renderer.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc,updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
const changePasswordModal = document.getElementById('changePasswordModal');
const closeButton = changePasswordModal ? changePasswordModal.querySelector('.close-button') : null;
const currentPasswordInput = document.getElementById('current-password-input');
const newPasswordInput = document.getElementById('new-password-input');
const confirmNewPasswordInput = document.getElementById('confirm-new-password-input');
const confirmChangePasswordBtn = document.getElementById('confirmChangePasswordBtn');
const modalPasswordMessageEl = document.getElementById('modal-password-message');


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

// --- FUNCIÓN PARA GENERAR INICIALES ---
function getInitials(firstName, lastName) {
  if (!firstName || !lastName) return 'N/A';
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
}

// --- FUNCIÓN PARA CARGAR LOS DATOS DEL PERFIL ---
async function cargarDatosPerfil(uid) {
  try {
    const empleadoRef = doc(db, "empleados", uid);
    const empleadoSnap = await getDoc(empleadoRef);

    if (empleadoSnap.exists()) {
      const empleadoData = empleadoSnap.data();
      let nombreCargo = "No asignado";

      // Obtener el nombre del cargo desde la referencia
      if (empleadoData.cargo) {
        const cargoSnap = await getDoc(empleadoData.cargo);
        if (cargoSnap.exists()) {
          nombreCargo = cargoSnap.data().nombrecargo;
        }
      }
      if (empleadoData.securityPin) {
  // Sí está configurado: muestra la sección "Activado"
  document.getElementById('pin-enabled-section').style.display = 'block';
  document.getElementById('pin-disabled-section').style.display = 'none';
} else {
  // No está configurado: muestra la sección "Desactivado"
  document.getElementById('pin-enabled-section').style.display = 'none';
  document.getElementById('pin-disabled-section').style.display = 'block';
}

      // 1. Poblar el HTML con los datos
      document.getElementById('user-name').textContent = `${empleadoData.nombre} ${empleadoData.apellido}`;
      document.getElementById('user-role').textContent = nombreCargo;
      document.getElementById('user-email').textContent = empleadoData.email;
      document.getElementById('user-rut').textContent = empleadoData.rut;
      document.getElementById('user-phone').textContent = empleadoData.telefono;

      // 2. Generar y mostrar las iniciales
      document.getElementById('user-initials').textContent = getInitials(empleadoData.nombre, empleadoData.apellido);
      
    } else {
      console.log("No se encontró un perfil para este usuario.");
      // Opcional: Redirigir si el perfil no existe, pero hay UID en sessionStorage
      // window.electronAPI.navigate('iniciosesion.html'); 
    }
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  }
}

// --- FUNCIÓN PARA CERRAR SESIÓN ---
async function handleLogout() {
  try {
    await signOut(auth);
    sessionStorage.removeItem('loggedInUserUid'); // Limpia el UID de la sesión
    console.log("Sesión cerrada con éxito. Redirigiendo al login.");
    window.electronAPI.navigate('iniciosesion.html');
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Error al cerrar sesión: " + error.message);
  }
}

// --- FUNCIÓN PARA CAMBIAR CONTRASEÑA ---
async function handleChangePassword() {
function openChangePasswordModal() {
  if (changePasswordModal) { // Asegurarse de que el modal exista
      changePasswordModal.style.display = 'flex'; // Hace visible el modal
      // Limpia los campos y mensajes cada vez que se abre el modal
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmNewPasswordInput.value = '';
      modalPasswordMessageEl.textContent = '';
  }
}
 // --- NUEVA FUNCIÓN para manejar la confirmación del cambio de contraseña ---
async function confirmPasswordChange() {
  const user = auth.currentUser;
  if (!user) {
    modalPasswordMessageEl.textContent = "Error: No hay usuario autenticado.";
    modalPasswordMessageEl.style.color = 'red';
    return;
  }

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    modalPasswordMessageEl.textContent = "Todos los campos son obligatorios.";
    modalPasswordMessageEl.style.color = 'red';
    return;
  }

  if (newPassword !== confirmNewPassword) {
    modalPasswordMessageEl.textContent = "La nueva contraseña y su confirmación no coinciden.";
    modalPasswordMessageEl.style.color = 'red';
    return;
  }

  if (newPassword.length < 6) {
    modalPasswordMessageEl.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
    modalPasswordMessageEl.style.color = 'red';
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    modalPasswordMessageEl.textContent = "Contraseña cambiada con éxito. Por seguridad, inicia sesión nuevamente.";
    modalPasswordMessageEl.style.color = 'green';

    setTimeout(async () => {
        if (changePasswordModal) changePasswordModal.style.display = 'none'; // Cierra el modal
        await handleLogout(); 
    }, 2000); 

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    if (error.code === 'auth/wrong-password') {
      modalPasswordMessageEl.textContent = "Error: Contraseña actual incorrecta.";
    } else if (error.code === 'auth/requires-recent-login') {
      modalPasswordMessageEl.textContent = "Error: Por favor, inicia sesión nuevamente para cambiar la contraseña.";
    } else {
      modalPasswordMessageEl.textContent = "Error al cambiar contraseña: " + error.message;
    }
    modalPasswordMessageEl.style.color = 'red';
  }
}
}

// --- EVENT LISTENERS AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Obtener referencias a los elementos del DOM (Incluyendo el modal) ---
  const changePasswordModal = document.getElementById('changePasswordModal');
  const closeButton = changePasswordModal ? changePasswordModal.querySelector('.close-button') : null;
  const currentPasswordInput = document.getElementById('current-password-input');
  const newPasswordInput = document.getElementById('new-password-input');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password-input');
  const confirmChangePasswordBtn = document.getElementById('confirmChangePasswordBtn');
  const modalPasswordMessageEl = document.getElementById('modal-password-message');

// --- Listeners para 2FA (PIN de Seguridad) ---
const createPinBtn = document.getElementById('createPinBtn');
const changePinBtn = document.getElementById('changePinBtn');
const removePinBtn = document.getElementById('removePinBtn');
const savePinBtn = document.getElementById('savePinBtn');
const cancelPinBtn = document.getElementById('cancelPinBtn');

if (createPinBtn) createPinBtn.addEventListener('click', () => showPinSetup(false));
if (changePinBtn) changePinBtn.addEventListener('click', () => showPinSetup(true));
if (removePinBtn) removePinBtn.addEventListener('click', removePin);
if (savePinBtn) savePinBtn.addEventListener('click', savePin);
if (cancelPinBtn) cancelPinBtn.addEventListener('click', cancelPinSetup);

// ... (tus listeners existentes para logout, cambiar contraseña, etc. se quedan) ...

  const logoutBtn = document.getElementById('logoutBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');

  // --- 2. Definir las funciones manejadoras del modal (AHORA DENTRO DE DOMContentLoaded) ---
  // --- NUEVAS FUNCIONES DE PIN DE SEGURIDAD ---

function showPinSetup(isChanging = false) {
  document.getElementById('pin-setup-title').textContent = isChanging ? 'Cambiar tu PIN de Seguridad' : 'Crear tu PIN de Seguridad';
  document.getElementById('new-pin-input').value = '';
  document.getElementById('confirm-pin-input').value = '';
  document.getElementById('pin-error-message').textContent = '';

  document.getElementById('pin-setup-section').style.display = 'block';
  document.getElementById('pin-enabled-section').style.display = 'none';
  document.getElementById('pin-disabled-section').style.display = 'none';
}

function cancelPinSetup() {
  document.getElementById('pin-setup-section').style.display = 'none';
  // Recarga los datos para mostrar el estado correcto (activado o desactivado)
  if (loggedInUserUid) cargarDatosPerfil(loggedInUserUid);
}

async function savePin() {
  const newPin = document.getElementById('new-pin-input').value;
  const confirmPin = document.getElementById('confirm-pin-input').value;
  const errorEl = document.getElementById('pin-error-message');

  // --- Validaciones ---
  if (!newPin || !confirmPin) {
    errorEl.textContent = 'Ambos campos son obligatorios.';
    return;
  }
  if (newPin.length !== 6 || confirmPin.length !== 6) {
    errorEl.textContent = 'El PIN debe tener exactamente 6 dígitos.';
    return;
  }
  if (!/^\d+$/.test(newPin)) { // Comprueba si son solo números
    errorEl.textContent = 'El PIN solo puede contener números.';
    return;
  }
  if (newPin !== confirmPin) {
    errorEl.textContent = 'Los PINs no coinciden.';
    return;
  }

  // ¡Validación exitosa!
  errorEl.textContent = '';
  try {
    const userRef = doc(db, "empleados", loggedInUserUid);
    await updateDoc(userRef, {
      securityPin: newPin // ¡Guardamos el PIN!
    });

    alert('¡Éxito! Tu PIN de seguridad ha sido guardado.');
    cancelPinSetup(); // Oculta el formulario y muestra la sección "Activado"

  } catch (err) {
    console.error("Error al guardar el PIN:", err);
    errorEl.textContent = 'Error al guardar en la base de datos.';
  }
}

async function removePin() {
  if (!confirm('¿Estás seguro de que quieres eliminar tu PIN de seguridad? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const userRef = doc(db, "empleados", loggedInUserUid);
    await updateDoc(userRef, {
      securityPin: null // O usa deleteField() si prefieres
    });

    alert('PIN de seguridad eliminado con éxito.');
    cancelPinSetup(); // Oculta el formulario y muestra la sección "Desactivado"

  } catch (err) {
    console.error("Error al eliminar el PIN:", err);
    alert('Error al eliminar el PIN de la base de datos.');
  }
}

  // Función para abrir el modal de cambiar contraseña
  function openChangePasswordModal() {
    if (changePasswordModal) {
        changePasswordModal.style.display = 'flex'; // Hace visible el modal
        // Limpia los campos y mensajes cada vez que se abre el modal
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        modalPasswordMessageEl.textContent = '';
    }
  }

  // Función para manejar la confirmación del cambio de contraseña
  async function confirmPasswordChange() {
    const user = auth.currentUser;
    if (!user) {
      modalPasswordMessageEl.textContent = "Error: No hay usuario autenticado.";
      modalPasswordMessageEl.style.color = 'red';
      return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      modalPasswordMessageEl.textContent = "Todos los campos son obligatorios.";
      modalPasswordMessageEl.style.color = 'red';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      modalPasswordMessageEl.textContent = "La nueva contraseña y su confirmación no coinciden.";
      modalPasswordMessageEl.style.color = 'red';
      return;
    }

    if (newPassword.length < 6) {
      modalPasswordMessageEl.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
      modalPasswordMessageEl.style.color = 'red';
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      modalPasswordMessageEl.textContent = "Contraseña cambiada con éxito. Por seguridad, inicia sesión nuevamente.";
      modalPasswordMessageEl.style.color = 'green';
      
      setTimeout(async () => {
          if (changePasswordModal) changePasswordModal.style.display = 'none';
          await handleLogout();
      }, 2000); 

    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      if (error.code === 'auth/wrong-password') {
        modalPasswordMessageEl.textContent = "Error: Contraseña actual incorrecta.";
      } else if (error.code === 'auth/requires-recent-login') {
        modalPasswordMessageEl.textContent = "Error: Por favor, inicia sesión nuevamente para cambiar la contraseña.";
      } else {
        modalPasswordMessageEl.textContent = "Error al cambiar contraseña: " + error.message;
      }
      modalPasswordMessageEl.style.color = 'red';
    }
  }

  // --- 3. Lógica para cargar el perfil al inicio ---
  const loggedInUserUid = sessionStorage.getItem('loggedInUserUid');
  if (loggedInUserUid) {
    cargarDatosPerfil(loggedInUserUid);
  } else {
    console.log("No se encontró UID de usuario en la sesión. Redirigiendo al login.");
    window.electronAPI.navigate('iniciosesion.html'); 
  }

  // --- 4. Asignar Event Listeners ---
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', openChangePasswordModal);
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (changePasswordModal) changePasswordModal.style.display = 'none';
    });
  }

  if (confirmChangePasswordBtn) {
    confirmChangePasswordBtn.addEventListener('click', confirmPasswordChange);
  }

  window.addEventListener('click', (event) => {
    if (event.target == changePasswordModal) {
      changePasswordModal.style.display = 'none';
    }
  });

}); 