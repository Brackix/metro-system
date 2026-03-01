import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import os from 'os';
import * as routes from './api/routes';

const app = express();
dotenv.config();

console.log('📦 Routes imported:', Object.keys(routes));
console.log('🔍 cardUsageRoutes exists?', routes.cardUsageRoutes);
console.log('🔍 Is it a function?', typeof routes.cardUsageRoutes);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Registrar todos los routers
app.use('/api/stations', routes.stationsRouter);
app.use('/api/paymethods', routes.payMethodsRoutes);
app.use('/api/users', routes.registrationRoutes);
app.use('/api/cards', routes.cardsRoutes);
app.use('/api/auth', routes.loginAuthRoutes);
app.use('/api/cardusage', routes.cardUsageRoutes);
app.use('/api/admin', routes.adminRoutes);
app.use('/api/recharges', routes.rechargesRoutes);  // ✅ AGREGAR

// ✅ Convierte a número
const port = Number(process.env.PORT) || 4000;

// ✅ Función para obtener la IP local automáticamente
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ✅ Escucha en 0.0.0.0 para aceptar conexiones desde la red local
app.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('✅ Server running on:');
  console.log(`   📍 Local:   http://localhost:${port}`);
  console.log(`   📍 Network: http://${localIP}:${port}`);
  console.log(`\n📱 Use in mobile: http://${localIP}:${port}/api`);
});
