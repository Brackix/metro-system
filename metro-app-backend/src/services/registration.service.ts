import prisma from "../config/prisma"
import { Request, Response } from 'express';


export async function readUsers(req: Request, res: Response) {
  const users = await prisma.users.findMany();
  res.status(200).json(users);
}

export async function register(req: Request, res: Response) {
    const { username, firstname, lastname, email, phone, passwordhash } = req.body;
    const newUser = await prisma.users.create({
      data: { username, firstname, lastname, email, phone, passwordhash }
    });
    res.status(201).json(newUser);
}

export async function deleteUser(req: Request, res: Response) {
    const { userid } = req.params;
    const id = Number(userid);
    await prisma.users.delete({
      where: { userid: Number(id) }
    });
    res.status(204).send();
}

export async function edituser(req: Request, res: Response) {
    const { userid } = req.params;
    const id = Number(userid);
    const { username, firstname, lastname, email, phone, passwordhash } = req.body;
    const updatedUser = await prisma.users.update({
      where: { userid: id }, // quita el Number() redundante
      data: { username, firstname, lastname, email, phone, passwordhash }
    });
    res.status(200).json(updatedUser);
}
