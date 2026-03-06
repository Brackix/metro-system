import { Router } from 'express';
import * as OmsaStopsController from '../controllers/omsaStops.controller';

const router = Router();

router.get('/search', OmsaStopsController.searchOmsaStops);
router.get('/', OmsaStopsController.readOmsaStops);

export default router;
