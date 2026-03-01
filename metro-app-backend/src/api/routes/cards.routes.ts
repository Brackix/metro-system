import { Router } from 'express';
import { createCard, deleteCardWithTransfer, readCards,readCard, editCard, rechargeCard, cardWid, deleteCard } from '../../services/cards.service';
const router = Router();

router.get('/user/:userid', readCard);
router.get('/', readCards);
router.get('/cardWid/:nfcuid', cardWid);
router.post('/', createCard);
router.post('/delete-with-transfer', deleteCardWithTransfer);  
router.delete('/:nfcuid', deleteCard)
router.patch('/:nfcuid', editCard);
router.patch('/:nfcuid/recharge', rechargeCard);

export default router;