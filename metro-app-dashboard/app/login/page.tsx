"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Pre-fill with Roebrt credentials for testing
  useEffect(() => {
    setName("admin")
    setPassword("admin")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(name, password)

      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al Sistema de Metro de Santo Domingo",
          variant: "default",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Nombre de usuario o contraseña incorrectos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error durante el inicio de sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo con imagen del metro (puedes reemplazar la URL por una del Metro de SD) */}
      <Image
        src="https://presidencia.gob.do/sites/default/files/styles/large/public/news/2025-02/WhatsApp%20Image%202025-02-21%20at%201.41.09%20PM.jpg?itok=qpJFAxR7https://img.mmc.com.do/cdn-bucket/uploads/2025/04/Metro-SD.jpg.webp"
        alt="Fondo Metro"
        fill
        priority
        className="object-cover scale-105 blur-sm"
      />
      {/* Capa de color verde con ligera transparencia */}
      <div className="absolute inset-0 bg-emerald-900/60" />

      <div className="relative z-10 w-full max-w-md p-4">
        <div className="text-center mb-8 text-white">
          <div className="flex justify-center mb-4">
          <div className="bg-white/90 p-3 rounded-full shadow-md ring-2 ring-emerald-500 overflow-hidden">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMbXedxEJCoQ8Yrd43J_dFO_Neo2_yol51rQ&s"
              alt="Metro de Santo Domingo"
              width={100}
              height={100}
              className="mx-auto rounded-full object-cover"
              />
          </div>
          </div>
          <h1 className="text-2xl font-bold">Metro de Santo Domingo</h1>
          <p className="text-emerald-100">Sistema de Administración</p>
        </div>

        <Card className="border-emerald-500/30 border bg-white/90 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-300" style={{ textAlign: "center" }}>Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300" style={{ textAlign: "center" }}>Ingrese sus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de Usuario</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ingrese su nombre de usuario"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="username"
                  className="focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10 focus-visible:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-emerald-700 hover:text-emerald-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <footer className="mt-6 text-center text-sm text-white/90">
          <p className="text-white">&copy; {new Date().getFullYear()} brackix todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  )
}
