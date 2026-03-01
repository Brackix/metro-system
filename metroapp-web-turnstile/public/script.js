const btnAccept = document.getElementById('btn-accept');
const btnReject = document.getElementById('btn-reject');
const card = document.getElementById('card');
const statusText = document.getElementById('status-text');
const iconWaiting = document.getElementById('icon-waiting');
const iconAccept = document.getElementById('icon-accept');
const iconReject = document.getElementById('icon-reject');
const tarjeta = document.getElementById('torniquete-img');
const tarjetaMitades = document.getElementById('tarjeta-mitades');
const brazo = document.getElementById('brazo-img');
const body = document.body;

let resetTimeout;
let isAnimating = false;

// Consultar la API cada 1 segundo


function hideAllIcons() {
  iconWaiting.classList.remove('visible');
  iconWaiting.classList.add('hidden');
  iconAccept.classList.remove('visible');
  iconAccept.classList.add('hidden');
  iconReject.classList.remove('visible');
  iconReject.classList.add('hidden');
}

function showAccept() {
  if (isAnimating) return;
  isAnimating = true;
  
  clearTimeout(resetTimeout);
  
  hideAllIcons();
  card.classList.remove('waiting', 'rejected');
  card.classList.add('accepted');
  statusText.textContent = "¡Aceptado!";
  
  iconAccept.classList.remove('hidden');
  iconAccept.classList.add('visible');
  body.classList.remove('waiting-border', 'rejected-border');
  body.classList.add('accepted-border');
  
  // Brazo entra
  setTimeout(() => {
    brazo.classList.add('entra');
  }, 100);
  
  // Brazo y tarjeta salen
  setTimeout(() => {
    brazo.classList.remove('entra');
    brazo.classList.add('sale');
    tarjeta.classList.add('sale');
  }, 1400);
  
  // Resetear
  setTimeout(() => {
    brazo.classList.remove('sale');
    tarjeta.classList.remove('sale');
    brazo.style.transform = 'translateY(-50%) translateX(280px)';
    tarjeta.style.opacity = '0';
  }, 2500);
  
  // Nueva tarjeta sube
  setTimeout(() => {
    tarjeta.style.opacity = '1';
    tarjeta.classList.add('sube');
  }, 2650);
  
  // Limpiar
  setTimeout(() => {
    tarjeta.classList.remove('sube');
    tarjeta.style.opacity = '';
    isAnimating = false;
  }, 3600);
  
  resetTimeout = setTimeout(() => {
    resetState();
  }, 5000);
}

function showReject() {
  if (isAnimating) return;
  isAnimating = true;
  
  clearTimeout(resetTimeout);
  
  hideAllIcons();
  card.classList.remove('waiting', 'accepted');
  card.classList.add('rejected');
  statusText.textContent = "Rechazado. Intente de nuevo.";
  
  iconReject.classList.remove('hidden');
  iconReject.classList.add('visible');
  body.classList.remove('waiting-border', 'accepted-border');
  body.classList.add('rejected-border');

  // PASO 1: Shake del card
  setTimeout(() => {
    card.classList.remove('rejected');
  }, 500);
  
  // PASO 2: En el momento del último shake, cambiar a mitades
  setTimeout(() => {
    // Ocultar tarjeta completa
    tarjeta.style.visibility = 'hidden';
    
    // Mostrar mitades en la misma posición
    tarjetaMitades.classList.remove('hidden');
    tarjetaMitades.classList.add('rompe');
  }, 550);
  
  // PASO 3: Las mitades terminaron de caer
  setTimeout(() => {
    tarjetaMitades.classList.remove('rompe');
    tarjetaMitades.classList.add('hidden');
    tarjeta.style.visibility = 'visible';
    tarjeta.style.opacity = '0';
  }, 2000);
  
  // PASO 4: Nueva tarjeta sube desde abajo
  setTimeout(() => {
    tarjeta.style.opacity = '1';
    tarjeta.classList.add('sube');
  }, 2100);
  
  // PASO 5: Limpiar todo
  setTimeout(() => {
    tarjeta.classList.remove('sube');
    tarjeta.style.opacity = '';
    tarjeta.style.visibility = '';
    isAnimating = false;
  }, 3050);
  
  resetTimeout = setTimeout(() => {
    resetState();
  }, 4200);
}


function resetState() {
  clearTimeout(resetTimeout);
  
  hideAllIcons();
  card.classList.remove('accepted', 'rejected');
  card.classList.add('waiting');
  statusText.textContent = "Esperando tu Tarjeta...";
  
  tarjeta.classList.remove('sale', 'sube');
  tarjeta.style.opacity = '';
  
  tarjetaMitades.classList.remove('rompe');
  tarjetaMitades.classList.add('hidden');
  
  brazo.classList.remove('entra', 'sale');
  brazo.style.transform = 'translateY(-50%) translateX(280px)';
  
  iconWaiting.classList.remove('hidden');
  iconWaiting.classList.add('visible');
  body.classList.remove('accepted-border', 'rejected-border');
  body.classList.add('waiting-border');
  
  isAnimating = false;
}

btnAccept.addEventListener('click', showAccept); 
btnReject.addEventListener('click', showReject);

document.querySelectorAll('button').forEach(button => {
  button.addEventListener('mouseenter', (e) => {
    const circle = button.querySelector('.btn-hover-circle');
    circle.style.width = '200px';
    circle.style.height = '200px';
  });
  
  button.addEventListener('mouseleave', (e) => {
    const circle = button.querySelector('.btn-hover-circle');
    circle.style.width = '0';
    circle.style.height = '0';
  });
});

window.addEventListener('load', resetState);

// 🔁 Consulta al servidor cada 1 segundo
setInterval(async () => {
  try {
    const res = await fetch('/api/estado');
    const data = await res.json();

    if (data.hayEvento) {
      console.log("Evento recibido:", data);
      if (data.valido) {
        showAccept();
      } else {
        showReject();
      }
    }
  } catch (err) {
    console.error('Error consultando estado:', err);
  }
}, 1000);


