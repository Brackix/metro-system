import { addadmin, getadmin, deleteadmin, updateadmin } from "../../services/admin.service";
import { Router } from 'express';
const router = Router();

router.post('/', addadmin);
router.get('/', getadmin);
router.delete('/:id', deleteadmin);
router.patch('/:id', updateadmin);

export default router;