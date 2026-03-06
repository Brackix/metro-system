const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variable para almacenar el último estado
let ultimoEstado = null;

// Endpoint para recibir validación (POST)
app.post('/api/validar', (req, res) => {
  const { valido } = req.body;

  // Validar que valido sea un booleano
  if (typeof valido !== 'boolean') {
    return res.status(400).json({
      error: 'El campo "valido" debe ser true o false'
    });
  }

  // Guardar el estado
  ultimoEstado = valido;

  console.log(`Tarjeta ${valido ? 'ACEPTADA' : 'RECHAZADA'}`);

  res.json({
    success: true,
    valido: valido,
    mensaje: valido ? 'Tarjeta aceptada' : 'Tarjeta rechazada',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para consultar el estado (GET)
app.get('/api/estado', (req, res) => {
  if (ultimoEstado === null) {
    return res.json({
      hayEvento: false,
      mensaje: 'Esperando validación'
    });
  }

  const estado = ultimoEstado;
  ultimoEstado = null; // Limpiar después de consultar

  res.json({
    hayEvento: true,
    valido: estado
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = Object.values(networkInterfaces)
    .flat()
    .filter(addr => addr.family === 'IPv4' && !addr.internal)
    .map(addr => addr.address);

  if (addresses.length > 0) {
    console.log(`🌐 Accesible en red local: <http://${addresses > [0]}:${PORT}`);
  }
});
