import { Router } from 'express';
import { login } from '../controllers/LoginAuth.controller';

const router = Router();

router.post('/login', login);

export default router;