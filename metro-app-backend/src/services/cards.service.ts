import { Prisma } from "@prisma/client";
import prisma from "../config/prisma"
import { Request, Response } from 'express';

export async function readCards(req: Request, res: Response) {
  const cards = await prisma.cards.findMany();
  res.status(200).json(cards);
}

export async function readCard(req: Request, res: Response) {
   try {
    const { userid } = req.params;
    console.log('🔍 Buscando tarjetas para userId:', userid);
    console.log('🔍 Tipo de userid:', typeof userid);
    
    const cards = await prisma.cards.findMany({
      where: { 
        userid: Number(userid)
      },
      orderBy: {
        registrationdate: 'desc'
      }
    });
    
    console.log('✅ Tarjetas encontradas:', cards);
    console.log('✅ Cantidad:', cards?.length || 0);
    
    res.json(cards || []);
  } catch (error: any) {
    console.error('❌ Error al obtener tarjetas:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function cardWid(req: Request, res: Response) {
  try {
    const { nfcuid } = req.params as { nfcuid: string };

    const card = await prisma.cards.findUnique({
      where: { nfcuid }
    });

    if (!card) {
      console.log('❌ Tarjeta no encontrada para nfcuid:', nfcuid);
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    const balance = Number(card.balance || 0);
    const newBalance = balance - 20;

    if (newBalance >= 0) {
      return res.json({ success: true, remainingBalance: newBalance });
    } else {
      return res.json({ success: false, message: 'Saldo insuficiente', balance });
    }

  } catch (error: any) {
    console.error('❌ Error al verificar tarjeta:', error);
    res.status(500).json({ error: error.message || 'Error al verificar tarjeta' });
  }
}

export async function createCard(req: Request, res: Response) {
  console.log("[createCard] body=", req.body);
  try {
    const { userid, nfcuid, alias, balance, status, cardtypeid } = req.body;

    const userIdNum = Number(userid);
    if (!userIdNum || !nfcuid || !alias) {
      console.warn("[createCard] invalid/missing", { userid, nfcuid, alias });
      return res.status(400).json({ error: "Faltan campos requeridos o tipos inválidos" });
    }

    const data = {
      userid: userIdNum,
      nfcuid: String(nfcuid),
      alias: String(alias),
      ...(status ? { status: String(status) } : {}),
      ...(balance != null ? { balance: Number(balance) } : {}),
      ...(cardtypeid != null ? { cardtypeid: Number(cardtypeid) } : {}),
    };

    console.log("[createCard] data=", data);
    const newCard = await prisma.cards.create({ data });
    console.log("[createCard] OK cardid=", newCard.cardid);
    return res.status(201).json(newCard);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      console.error("[createCard] VALIDATION FAIL:", e.message);
      return res.status(400).json({ error: "Validación Prisma: " + e.message });
    }
    console.error("[createCard] FAIL:", e?.message || e);
    return res.status(500).json({ error: "Error al crear tarjeta" });
  }
}

export async function deleteCard(req: Request, res: Response) {
    const { nfcuid } = req.params;
    const id = String(nfcuid);
    await prisma.cards.delete({
      where: { nfcuid: String(id) }
    });
    res.status(204).send();
}

export async function editCard(req: Request, res: Response) {
  const { nfcuid } = req.params;
  const updates = req.body;
  try {
    const updatedCard = await prisma.cards.update({
      where: { nfcuid: String(nfcuid) },
      data: updates
    });
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(400).json({ error: "No se pudo actualizar la tarjeta" });
  }
}

export async function deleteCardWithTransfer(req: Request, res: Response) {
  const { cardIdToDelete, targetCardId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Buscar tarjeta a eliminar
      const cardToDelete = await tx.cards.findUnique({
        where: { cardid: cardIdToDelete },
      });
      if (!cardToDelete) throw new Error("Tarjeta no encontrada");

      // 2️⃣ Buscar tarjeta destino
      const targetCard = await tx.cards.findUnique({
        where: { cardid: targetCardId },
      });
      if (!targetCard) throw new Error("Tarjeta destino no encontrada");

      // 3️⃣ Transferir saldo
      const balanceToTransfer = Number(cardToDelete.balance || 0);
      const newBalance = Number(targetCard.balance || 0) + balanceToTransfer;

      await tx.cards.update({
        where: { cardid: targetCardId },
        data: { balance: newBalance },
      });

      // 4️⃣ Registrar la tarjeta eliminada en deletedcards
      await tx.deletedcards.create({
        data: {
          originalcardid: cardToDelete.cardid,
          userid: cardToDelete.userid,
          cardtypeid: cardToDelete.cardtypeid,
          nfcuid: cardToDelete.nfcuid,
          alias: cardToDelete.alias,
          balance: 0,
          status: cardToDelete.status,
          registrationdate: cardToDelete.registrationdate,
          lastrecharge: cardToDelete.lastrecharge,
          lastuse: cardToDelete.lastuse,
          transferredto: targetCardId,
        },
      });

      // 5️⃣ Transferir los usos (cardusage ➜ cardusagehistory)
      const cardUsagesToMove = await tx.cardusage.findMany({
        where: { cardid: cardIdToDelete },
      });

      if (cardUsagesToMove.length > 0) {
        await tx.cardusagehistory.createMany({
          data: cardUsagesToMove.map((usage) => ({
            usageid: usage.usageid,
            cardid: usage.cardid,
            stationid: usage.stationid,
            fareapplied: usage.fareapplied,
            previousbalance: usage.previousbalance,
            newbalance: usage.newbalance,
            usagedate: usage.usagedate,
            validationsuccessful: usage.validationsuccessful,
            rejectionreason: usage.rejectionreason,
            usagetype: usage.usagetype,
          })),
        });

        // Eliminar los registros originales en cardusage
        await tx.cardusage.deleteMany({
          where: { cardid: cardIdToDelete },
        });
      }

      // ✅ 6️⃣ NUEVO: Eliminar recargas de la tarjeta
      await tx.recharges.deleteMany({
        where: { cardid: cardIdToDelete },
      });

      // 7️⃣ Finalmente eliminar la tarjeta
      await tx.cards.delete({
        where: { cardid: cardIdToDelete },
      });

      return {
        deletedCard: cardToDelete,
        newBalance,
        balanceTransferred: balanceToTransfer,
      };
    });

    res.json({
      message: "✅ Tarjeta eliminada exitosamente",
      balanceTransferred: result.balanceTransferred,
      newBalanceInTarget: result.newBalance,
    });
  } catch (error: any) {
    console.error("❌ Error en deleteCardWithTransfer:", error);
    res.status(500).json({ 
      error: error.message || "Error al eliminar tarjeta" 
    });
  }
}


// ✅ FUNCIÓN ACTUALIZADA CON HISTORIAL
export async function rechargeCard(req: Request, res: Response) {
  const { nfcuid } = req.params;
  const { amount, paymentmethod, deviceip, devicemodel } = req.body;

  try {
    const amountNum = Number(amount);
    
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    if (!paymentmethod) {
      return res.status(400).json({ error: 'Método de pago requerido' });
    }

    // 🔄 Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (prisma) => {
      // 1️⃣ Obtener la tarjeta actual
      const card = await prisma.cards.findUnique({
        where: { nfcuid: String(nfcuid) }
      });

      if (!card) {
        throw new Error('Tarjeta no encontrada');
      }

      const previousBalance = Number(card.balance || 0);
      const newBalance = previousBalance + amountNum;

      // 2️⃣ Actualizar el balance de la tarjeta
      const updatedCard = await prisma.cards.update({
        where: { nfcuid: String(nfcuid) },
        data: {
          balance: newBalance,
          lastrecharge: new Date()
        }
      });

      // 3️⃣ Crear registro en la tabla recharges
      const recharge = await prisma.recharges.create({
        data: {
          userid: card.userid,
          cardid: card.cardid,
          amount: amountNum,
          previousbalance: previousBalance,
          newbalance: newBalance,
          paymentmethod: String(paymentmethod),
          transactionstatus: 'completed',
          deviceip: deviceip || null,
          devicemodel: devicemodel || null,
        }
      });

      return {
        card: updatedCard,
        recharge: recharge
      };
    });

    res.json({
      message: 'Recarga exitosa',
      previousBalance: result.recharge.previousbalance,
      newBalance: result.card.balance,
      rechargeId: result.recharge.rechargeid
    });

  } catch (error: any) {
    console.error('❌ Error al recargar tarjeta:', error);
    res.status(500).json({ 
      error: error.message || 'Error al recargar tarjeta' 
    });
  }
}
