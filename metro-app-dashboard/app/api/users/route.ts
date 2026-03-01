import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "public/data/users.json")

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, "utf-8")
    const users = JSON.parse(data)
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: "Error al leer los usuarios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const newUser = await request.json()
  try {
    const data = fs.readFileSync(filePath, "utf-8")
    const users = JSON.parse(data)
    const id = Date.now()
    const userWithId = { ...newUser, id }
    users.push(userWithId)
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2))
    return NextResponse.json({ success: true, user: userWithId })
  } catch (error) {
    return NextResponse.json({ message: "Error al registrar usuario" }, { status: 500 })
  }
}
