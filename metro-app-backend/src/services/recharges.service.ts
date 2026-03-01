import { Request, Response } from 'express';
import prisma from '../config/prisma';

// GET - Obtener todas las recargas
export const getRecharges = async (req: Request, res: Response) => {
  try {
    const recharges = await prisma.recharges.findMany({
      include: {
        users: {
          select: {
            firstname: true,
            lastname: true
          }
        },
        cards: {
          select: {
            nfcuid: true
          }
        }
      },
      orderBy: {
        rechargedate: 'desc'
      }
    });

    const formattedRecharges = recharges.map(r => ({
      rechargeid: r.rechargeid,
      cardid: r.cardid,
      userid: r.userid,
      amount: r.amount,
      previousbalance: r.previousbalance,
      newbalance: r.newbalance,
      paymentmethod: r.paymentmethod,
      transactionstatus: r.transactionstatus,
      rechargedate: r.rechargedate,
      deviceip: r.deviceip,
      devicemodel: r.devicemodel,
      customer_name: `${r.users.firstname} ${r.users.lastname}`,
      cardnumber: r.cards.nfcuid
    }));

    res.json(formattedRecharges);
  } catch (error) {
    console.error('❌ Error fetching recharges:', error);
    res.status(500).json({ message: 'Error al obtener recargas' });
  }
};

// GET - Obtener una recarga por ID
export const getRecharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // ✅ Validar que id exista
    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }
    
    const recharge = await prisma.recharges.findUnique({
      where: { rechargeid: parseInt(id) },
      include: {
        users: {
          select: {
            firstname: true,
            lastname: true
          }
        },
        cards: {
          select: {
            nfcuid: true
          }
        }
      }
    });

    if (!recharge) {
      return res.status(404).json({ message: 'Recarga no encontrada' });
    }

    const formatted = {
      ...recharge,
      customer_name: `${recharge.users.firstname} ${recharge.users.lastname}`,
      cardnumber: recharge.cards.nfcuid
    };

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching recharge:', error);
    res.status(500).json({ message: 'Error al obtener recarga' });
  }
};

// POST - Crear nueva recarga
export const addRecharge = async (req: Request, res: Response) => {
  try {
    const { 
      userid, 
      cardid, 
      amount, 
      previousbalance, 
      newbalance, 
      paymentmethod,
      deviceip,
      devicemodel
    } = req.body;

    if (!userid || !cardid || !amount || !paymentmethod) {
      return res.status(400).json({ 
        message: 'Campos obligatorios: userid, cardid, amount, paymentmethod' 
      });
    }

    const recharge = await prisma.recharges.create({
      data: {
        userid: parseInt(userid),
        cardid: parseInt(cardid),
        amount: parseFloat(amount),
        previousbalance: previousbalance ? parseFloat(previousbalance) : 0,
        newbalance: newbalance ? parseFloat(newbalance) : parseFloat(amount),
        paymentmethod,
        transactionstatus: 'completed',
        deviceip: deviceip || null,
        devicemodel: devicemodel || null
      }
    });

    res.status(201).json(recharge);
  } catch (error) {
    console.error('❌ Error creating recharge:', error);
    res.status(500).json({ message: 'Error al crear recarga' });
  }
};

// DELETE - Eliminar una recarga
export const deleteRecharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ✅ Validar que id exista
    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    await prisma.recharges.delete({
      where: { rechargeid: parseInt(id) }
    });

    res.json({ message: 'Recarga eliminada correctamente' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Recarga no encontrada' });
    }
    console.error('❌ Error deleting recharge:', error);
    res.status(500).json({ message: 'Error al eliminar recarga' });
  }
};

// PATCH - Actualizar una recarga
export const updateRecharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionstatus, paymentmethod } = req.body;

    // ✅ Validar que id exista
    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const updateData: any = {};
    if (transactionstatus) updateData.transactionstatus = transactionstatus;
    if (paymentmethod) updateData.paymentmethod = paymentmethod;

    const recharge = await prisma.recharges.update({
      where: { rechargeid: parseInt(id) },
      data: updateData
    });

    res.json(recharge);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Recarga no encontrada' });
    }
    console.error('❌ Error updating recharge:', error);
    res.status(500).json({ message: 'Error al actualizar recarga' });
  }
};
