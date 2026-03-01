import { Router } from 'express';
import { addCardUsage, readCardUsage, registerCardTap } from '../../services/cardUsage.service';

const router = Router();

router.post('/add', addCardUsage);
router.get('/read', readCardUsage);
router.post('/registerTap', registerCardTap);

export default router;
