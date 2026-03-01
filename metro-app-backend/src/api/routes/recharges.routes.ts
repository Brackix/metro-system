import { Router } from 'express';
import { 
  getRecharges, 
  getRecharge, 
  addRecharge, 
  deleteRecharge, 
  updateRecharge 
} from '../../services/recharges.service';

const router = Router();

router.get('/', getRecharges);
router.get('/:id', getRecharge);
router.post('/', addRecharge);
router.delete('/:id', deleteRecharge);
router.patch('/:id', updateRecharge);

export default router;
