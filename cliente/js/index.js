import { Check } from './check.js';

const Cliente = {
  send: (data) => {
    fetch('http://localhost:3000/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Ítem creado:', data);
      })
      .catch(error => {
        console.error('Error al crear el ítem:', error);
      });

  }
}

// Función para cargar la configuración y crear los controles
let checkInstances = []; // Array para guardar las instancias de Check

async function initializeControls() {
  try {
    const response = await fetch('http://localhost:3000/api/config');
    const grupos = await response.json();

    const container = document.getElementById('container');

    grupos.forEach(grupo => {
      const divGrupo = document.createElement('div');
      divGrupo.id = grupo.id;
      container.appendChild(divGrupo);

      // Crear los controles para este grupo
      const check = new Check(divGrupo, Cliente);
      checkInstances.push(check); // Guardamos la instancia
      grupo.valvulas.forEach(valvula => {
        check.addCheck(`${grupo.id}_${valvula}`);
      });
    });

    // Agregar el evento al botón
    document.getElementById('toggleConnection').addEventListener('click', (e) => {
      checkInstances.forEach(check => check.toggleConnection());
      // Corregimos la lógica del cambio de texto
      e.target.textContent = e.target.textContent === 'Cambiar a Socket.IO' ?
        'Cambiar a REST' : 'Cambiar a Socket.IO';
    });

  } catch (error) {
    console.error('Error al cargar la configuración:', error);
  }
}

// Inicializar al cargar la página
initializeControls();