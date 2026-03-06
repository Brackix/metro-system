import stationsRouter from './stations.routes';
import registrationRoutes from './registration.routes'
import payMethodsRoutes from './payMethods.routes'
import loginAuthRoutes from './LoginAuth.routes';
import cardsRoutes from './cards.routes';
import cardUsageRoutes from './cardUsage.routes';
import adminRoutes from './admin.routes';
import rechargesRoutes from './recharges.routes';
import omsaStopsRoutes from './omsaStops.routes';
//Exportar todas las rutas para utilizarlas en src/index.ts
export {
  stationsRouter,
  registrationRoutes,
  payMethodsRoutes,
  loginAuthRoutes,
  cardsRoutes,
  cardUsageRoutes,
  adminRoutes,
  rechargesRoutes,
  omsaStopsRoutes
};