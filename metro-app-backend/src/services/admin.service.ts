import prisma from "../config/prisma";
import { Request, Response } from 'express';

export async function addadmin(req: Request, res: Response) {
  try {
    const { firstname, lastname, email, phone, permissions } = req.body;
    const newadmin = await prisma.adminusers.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        permissions
      }
    });
    res.status(201).json(newadmin);
  } catch (error) {
    console.error("Error adding admin user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getadmin(req: Request, res: Response) {
  try {
    const adminusers = await prisma.adminusers.findMany();
    res.status(200).json(adminusers);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteadmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deletedadmin = await prisma.adminusers.delete({
      where: { adminid: Number(id) }
    });
    res.status(200).json(deletedadmin);
  } catch (error) {
    console.error("Error deleting admin user:", error);
    res.status(500).json({ error: "Internal server error" });
}
}

export async function updateadmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, phone, permissions } = req.body;
    const updatedadmin = await prisma.adminusers.update({
      where: { adminid: Number(id) },
      data: {
        firstname,
        lastname,
        email,
        phone,
        permissions
      }
    });
    res.status(200).json(updatedadmin);
  } catch (error) {
    console.error("Error updating admin user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
