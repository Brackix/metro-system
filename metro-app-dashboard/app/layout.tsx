import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-context"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>Metro de Santo Domingo - Sistema de Administración</title>
        <meta name="description" content="Sistema de administración para el Metro de Santo Domingo" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
