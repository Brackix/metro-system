import { Router } from 'express';
import { register, deleteUser, edituser, readUsers } from '../../services/registration.service'; 
const router = Router();

router.get('/', readUsers);
router.post('/', register);
router.delete('/:userid', deleteUser);
router.patch('/:userid', edituser);

export default router;



