// app/api/users/[id]/route.ts
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

const filePath = path.join(process.cwd(), "public/data/users.json")

function readUsers() {
  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

function writeUsers(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const updatedUser = await req.json()

    const users = readUsers()
    const index = users.findIndex((user: any) => user.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    users[index] = { ...users[index], ...updatedUser }

    writeUsers(users)

    return NextResponse.json({ message: "Usuario actualizado", user: users[index] })
  } catch (error) {
    console.error("Error en PUT:", error)
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 })
  }
}
