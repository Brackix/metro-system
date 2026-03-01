import { Router } from 'express';
import { addPayMethod, deletePayMethod, editPayMethod, readPayMethods } from '../../services/payMethods.service'; 

const router = Router();

router.get('/read/:userid', readPayMethods); 
router.post('/add', addPayMethod);         // Crear nuevo método
router.patch('/edit', editPayMethod);      // Actualizar método
router.delete('/delete/:paymentid', deletePayMethod);  // Eliminar método

export default router;