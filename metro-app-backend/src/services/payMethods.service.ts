import prisma from "../config/prisma"
import { Request, Response } from 'express';


export async function readPayMethods(req: Request, res: Response) {
  const { userid } = req.params;
  const payMethods = await prisma.paymentmethods.findMany({
    where: { userid: Number(userid) }
  });
  res.status(200).json(payMethods);
}


export async function addPayMethod(req: Request, res: Response) {
    const { userid, paymentmethodnumber, cvv, ex_month, ex_year } = req.body;
    const newMethod = await prisma.paymentmethods.create({
    data: { userid, paymentmethodnumber, cvv, ex_month, ex_year }
    });
    res.status(201).json(newMethod);
}


export async function editPayMethod(req: Request, res: Response) {
    const { paymentid, userid, paymentmethodnumber, cvv, ex_month, ex_year } = req.body;
    const updatedUser = await prisma.paymentmethods.update({
        where: { paymentid: Number(paymentid) },
        data: { userid, paymentmethodnumber, cvv, ex_month, ex_year }
    });
    res.status(200).json(updatedUser);
}




export async function deletePayMethod(req: Request, res: Response) {
    const { paymentid } = req.params;
    const id = Number(paymentid);
    await prisma.paymentmethods.delete({
        where: { paymentid: Number(id) }
    });
    res.status(204).send();
}