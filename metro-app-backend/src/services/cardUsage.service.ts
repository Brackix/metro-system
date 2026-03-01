import prisma from "../config/prisma";
import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function addCardUsage(req: Request, res: Response) {
  try {
    const { cardid, userid, stationid, fareapplied } = req.body;

    // Verificar si la tarjeta existe y obtener su estado y balance actual
    const card = await prisma.cards.findUnique({
      where: { cardid: Number(cardid) }
    });

    if (!card) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    // Si la tarjeta no está activa
    if (card.status !== 'active') {
      const inactiveUsage = await prisma.cardusage.create({
        data: {
          cardid: Number(cardid),
          userid: Number(userid),
          stationid: Number(stationid),
          fareapplied: Number(fareapplied),
          previousbalance: card.balance || 0,
          newbalance: card.balance || 0,
          usagedate: new Date(),
          validationsuccessful: false,
          rejectionreason: 'card not active'
        }
      });

      return res.status(200).json(inactiveUsage);
    }

    // Si la tarjeta está activa
    const previousBalance = card.balance || 0;
    let newBalance = Number(previousBalance) - Number(fareapplied);
    
    // Si el nuevo balance es negativo, ponerlo en 0
    if (newBalance < 0) {
      newBalance = 0;
    }

    // Usar transacción para actualizar ambas tablas de forma atómica
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el balance en la tabla cards
      await tx.cards.update({
        where: { cardid: Number(cardid) },
        data: { 
          balance: newBalance,
          lastuse: new Date()
        }
      });

      // Crear el registro de uso
      const usage = await tx.cardusage.create({
        data: {
          cardid: Number(cardid),
          userid: Number(userid),
          stationid: Number(stationid),
          fareapplied: Number(fareapplied),
          previousbalance: previousBalance,
          newbalance: newBalance,
          usagedate: new Date(),
          validationsuccessful: true,
          rejectionreason: null
        }
      });

      return usage;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error('Error al registrar uso de tarjeta:', error);
    res.status(500).json({ error: 'Error al registrar el uso de la tarjeta' });
  }
}

export async function registerCardTap(req: Request, res: Response) {
  try {
    const { nfcuid, reqType, stationid } = req.body;
    const usageType = reqType || 'card';
    const fare = 20; // Tarifa fija

    // Validar que stationid exista
    if (!stationid) {
      return res.status(400).json({ error: 'stationid es obligatorio' });
    }

    // Buscar la estación
    const station = await prisma.stations.findUnique({
      where: { stationid: Number(stationid) },
    });
    if (!station) {
      return res.status(404).json({ success: false, error: 'Estación no encontrada' });
    }

    // Buscar la tarjeta
    const card = await prisma.cards.findUnique({
      where: { nfcuid },
    });
    if (!card) {
      return res.status(404).json({ success: false, error: 'Tarjeta no encontrada' });
    }

    const userid = card.userid;
    const previousBalance = Number(card.balance) || 0;
    const fareAmount = Number(fare);
    let newBalance = previousBalance - fareAmount;
    let rejectionreason: string | null = null;
    let validationsuccessful = false;
    let success = true;

    // Si no hay fondos suficientes, registrar igual pero sin descontar
    if (previousBalance - fareAmount < 0) {
      newBalance = previousBalance; // no descontar
      rejectionreason = 'insufficient funds';
      validationsuccessful = false;
      success = false;
    }

    // Transacción atómica
    const usage = await prisma.$transaction(async (tx) => {
      // Solo actualizar balance si hubo fondos suficientes
        

      if (success) {
        validationsuccessful = true; // <- ¡Asegúrate de ponerlo aquí!
        await tx.cards.update({
          where: { cardid: card.cardid },
          data: {
            balance: newBalance,
            lastuse: new Date(),
          },
        });
      } else {
        // solo actualizar fecha de último uso, sin tocar el balance
        await tx.cards.update({
          where: { cardid: card.cardid },
          data: {
            lastuse: new Date(),
          },
        });
      }

      // Crear registro de uso siempre, con éxito o sin fondos
      return await tx.cardusage.create({
        data: {
          cardid: card.cardid,
          userid,
          stationid: station.stationid,
          fareapplied: fareAmount,
          previousbalance: previousBalance,
          newbalance: newBalance,
          usagedate: new Date(),
          validationsuccessful: validationsuccessful,
          rejectionreason: rejectionreason,
          usagetype: usageType,
        },
      });
    });
    
    // Respuesta según el caso
    if (!success) {
      try {
        await fetch(`${process.env.TURNIQUETE_URL}/api/validar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valido: validationsuccessful })
        });
          console.log('📤 Estado enviado al servidor visual');
        } catch (eRR) {
          console.warn('⚠️ No se pudo conectar al servidor visual:', eRR);
      }

      return res.status(400).json({
        success: false,
        error: 'Fondos insuficientes',
        usage,
      });
    }
        // ✅ Enviar respuesta correctamente
    res.status(201).json({ success: true, usage });


    try {
        await fetch(`${process.env.TURNIQUETE_URL}/api/validar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valido: validationsuccessful })
        });
          console.log('📤 Estado enviado al servidor visual');
        } catch (eRR) {
          console.warn('⚠️ No se pudo conectar al servidor visual:', eRR);
      }
    // Si luego quieres hacer un fetch adicional al endpoint /validar
    // debes hacerlo *después* y sin interferir con la respuesta
      

  } catch (error) {
    console.error('❌ Error en registerCardTap:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al registrar uso de tarjeta' });
    }
  }
}




export async function readCardUsage(req: Request, res: Response) {
  try {
    const usages = await prisma.cardusage.findMany();
    
    // Prisma findMany devuelve un array vacío [], nunca null
    if (usages.length === 0) {
      return res.status(200).json({ 
        message: '0 registros encontrados',
        data: []
      });
    }
    
    res.status(200).json({
      data: usages
    });
  } catch (error) {
    console.error('Error al leer los usos de tarjetas:', error);
    res.status(500).json({ 
      error: 'Error al leer los usos de tarjetas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
