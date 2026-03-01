"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import {
  Activity,
  AlertTriangle,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Train,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetroLineStatus } from "@/components/metro-line-status"
import { UserDataGrid } from "@/components/user-data-grid"
import {  
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { TransactionHistory } from "@/components/transaction-history"

const MetroMap = dynamic(
  () => import("@/components/metro-map").then(mod => ({ default: mod.MetroMap })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64">Cargando mapa...</div>
  }
)

const StationList = dynamic(
  () => import("@/components/station-list"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Cargando estaciones...</div>
  }
)

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Train className="h-6 w-6" />
              <h1 className="text-xl font-bold">Metro SD</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Resumen</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "users"} onClick={() => setActiveTab("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Usuarios</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "stations"} onClick={() => setActiveTab("stations")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Estaciones</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Transacciones</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user ? getInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || "Invitado"}</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="border-b flex-shrink-0">
            <div className="flex h-16 items-center px-4 md:px-6">
              <Button variant="outline" size="icon" className="mr-4 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Alternar menú</span>
              </Button>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline-block">Actualizaciones en vivo</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user ? getInitials(user.name) : "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
                    <DropdownMenuItem disabled>Configuración</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* ✅ Main con solo el padding necesario para el TabsList */}
          <main className="flex-1 overflow-auto">
            {activeTab === "transactions" && (
              <div className="fixed bottom-4 right-4 z-10">
                <Button
                  onClick={() => {
                    const newTransaction = {
                      id: Date.now(),
                      branchId: Math.floor(Math.random() * 6) + 1,
                      date: new Date().toISOString().split("T")[0],
                      type: ["Depósito", "Retiro", "Transferencia", "Pago de Préstamo"][Math.floor(Math.random() * 4)],
                      amount: Math.floor(Math.random() * 50000) + 1000,
                      customer: ["Juan Pérez", "María García", "Carlos Rodríguez", "Ana Martínez", "Luis Hernández"][
                        Math.floor(Math.random() * 5)
                      ],
                      status: "Completada",
                      timestamp: new Date().toLocaleString(),
                    }

                    const existingTransactionsJson = localStorage.getItem("metroapp-transactions")
                    const existingTransactions = existingTransactionsJson ? JSON.parse(existingTransactionsJson) : []
                    const updatedTransactions = [newTransaction, ...existingTransactions]
                    localStorage.setItem("metroapp-transactions", JSON.stringify(updatedTransactions))

                    toast({
                      title: "Transacción añadida",
                      description: `Nueva ${newTransaction.type.toLowerCase()} de RD$ ${newTransaction.amount.toLocaleString()} registrada`,
                      variant: "default",
                    })
                  }}
                  size="sm"
                  className="shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" /> Simular Nueva Transacción
                </Button>
              </div>
            )}
            
            {/* ✅ Tabs sin space-y */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              {/* ✅ TabsList con padding solo arriba y a los lados */}
              <div className="px-4 pt-4 md:px-6 md:pt-6">
                <TabsList>
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                  <TabsTrigger value="stations">Estaciones</TabsTrigger>
                  <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                </TabsList>
              </div>
              
              {/* ✅ Overview con padding normal */}
              <TabsContent value="overview" className="p-4 md:p-6 space-y-4 mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-green-200 dark:bg-green-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Trenes Activos</CardTitle>
                      <Train className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42</div>
                      <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-200 dark:bg-blue-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pasajeros Hoy</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">245,678</div>
                      <p className="text-xs text-muted-foreground">+12% desde ayer</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-200 dark:bg-red-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rendimiento Puntual</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94.2%</div>
                      <p className="text-xs text-muted-foreground">+0.5% desde la semana pasada</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-200 dark:bg-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">Retrasos menores en Línea Roja</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="lg:col-span-4">
                    <CardHeader>
                      <CardTitle>Mapa del Metro</CardTitle>
                      <CardDescription>Vista en vivo del sistema de metro</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MetroMap />
                    </CardContent>
                  </Card>
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Estado de las Líneas</CardTitle>
                      <CardDescription>Estado actual de todas las líneas de metro</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MetroLineStatus />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ✅ Usuarios - SIN space-y-4, solo padding */}
              <TabsContent value="users" className="p-4 md:p-6 mt-0">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
                  <p className="text-muted-foreground">Ver, editar y eliminar usuarios registrados</p>
                </div>
                <UserDataGrid currentUser={user} />
              </TabsContent>

              {/* ✅ Estaciones - SIN space-y-4, solo padding */}
              <TabsContent value="stations" className="p-4 md:p-6 mt-0">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Información de Estaciones</h2>
                  <p className="text-muted-foreground">Ver todas las estaciones y su estado actual</p>
                </div>
                <StationList />
              </TabsContent>

              {/* ✅ Transacciones con padding */}
              <TabsContent value="transactions" className="p-4 md:p-6 mt-0">
                <TransactionHistory />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
