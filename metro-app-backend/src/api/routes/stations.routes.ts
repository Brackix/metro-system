// src/api/routes/stations.route.ts
import { Router } from 'express';
import * as StationsController from '../controllers/stations.controller';

const router = Router();

// More specific routes first (e.g., /search) to avoid conflicts with params like /:id
router.get('/search', StationsController.searchStations);

// CRUD
router.get('/', StationsController.readStations);
router.post('/', StationsController.createStation);
router.patch('/:id', StationsController.updateStation);
router.delete('/:id', StationsController.deleteStation);

export default router;
