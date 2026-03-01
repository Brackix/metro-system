"use client"

import { useState, useEffect } from "react"
import { Search, Download, ArrowUpDown, Calendar, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as rechargeService from "@/app/routes/recharges"

interface Recharge {
  rechargeid: number
  userid: number
  cardid: number
  amount: number
  previousbalance: number
  newbalance: number
  paymentmethod: string
  transactionstatus: string
  rechargedate: string
  deviceip?: string
  devicemodel?: string
  customer_name: string
  cardnumber: string
}

export function TransactionHistory() {
  const [recharges, setRecharges] = useState<Recharge[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)

  const fetchRecharges = async () => {
    try {
      setIsLoading(true)
      const response = await rechargeService.getRecharges()
      console.log('✅ Recargas cargadas:', response.data)
      setRecharges(response.data || [])
    } catch (error) {
      console.error("❌ Error fetching recharges:", error)
      setRecharges([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecharges()
  }, [])

  const filteredRecharges = recharges.filter((recharge) => {
    const matchesSearch =
      recharge.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recharge.paymentmethod?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recharge.amount.toString().includes(searchQuery) ||
      recharge.cardnumber?.includes(searchQuery)

    const matchesMethod = methodFilter === "all" || recharge.paymentmethod === methodFilter

    return matchesSearch && matchesMethod
  })

  const sortedRecharges = [...filteredRecharges].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.rechargedate).getTime() - new Date(a.rechargedate).getTime()
    } else if (sortOrder === "oldest") {
      return new Date(a.rechargedate).getTime() - new Date(b.rechargedate).getTime()
    } else if (sortOrder === "highest") {
      return b.amount - a.amount
    } else if (sortOrder === "lowest") {
      return a.amount - b.amount
    }
    return 0
  })

  const totalAmount = recharges.reduce((sum, r) => sum + r.amount, 0)
  const today = new Date().toDateString()
  const todayRecharges = recharges.filter((r) => new Date(r.rechargedate).toDateString() === today)
  const todayAmount = todayRecharges.reduce((sum, r) => sum + r.amount, 0)

  const exportToCSV = () => {
    const headers = ["ID", "Fecha", "Cliente", "Tarjeta", "Monto", "Balance Anterior", "Nuevo Balance", "Método", "Estado"]
    const csvData = [
      headers.join(","),
      ...sortedRecharges.map((r) =>
        [
          r.rechargeid,
          new Date(r.rechargedate).toLocaleDateString(),
          r.customer_name,
          r.cardnumber,
          r.amount,
          r.previousbalance,
          r.newbalance,
          r.paymentmethod,
          r.transactionstatus,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `recargas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta recarga?")) {
      try {
        await rechargeService.deleteRecharge(id.toString())
        await fetchRecharges()
      } catch (error) {
        console.error("Error deleting recharge:", error)
      }
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando recargas...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Recargas</CardTitle>
            <CardDescription>Número de recargas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recharges.length}</div>
            <p className="text-xs text-muted-foreground">{todayRecharges.length} recargas hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Volumen Total</CardTitle>
            <CardDescription>Monto total de recargas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">RD$ {todayAmount.toLocaleString()} hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Promedio por Recarga</CardTitle>
            <CardDescription>Monto promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RD$ {recharges.length ? Math.round(totalAmount / recharges.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Basado en todas las recargas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Historial de Recargas</CardTitle>
              <CardDescription>Ver todas las recargas registradas</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar recargas..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="highest">Mayor monto</SelectItem>
                  <SelectItem value="lowest">Menor monto</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={exportToCSV} title="Exportar a CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRecharges.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        Fecha <Calendar className="ml-1 h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tarjeta</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Monto (RD$) <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableHead>
                    <TableHead>Balance Ant.</TableHead>
                    <TableHead>Nuevo Balance</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecharges.map((recharge) => (
                    <TableRow key={recharge.rechargeid}>
                      <TableCell>
                        <div className="font-medium">
                          {new Date(recharge.rechargedate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(recharge.rechargedate).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>{recharge.customer_name}</TableCell>
                      <TableCell className="font-mono text-xs">{recharge.cardnumber}</TableCell>
                      <TableCell className="font-medium">RD$ {recharge.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        RD$ {recharge.previousbalance.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        RD$ {recharge.newbalance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{recharge.paymentmethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            recharge.transactionstatus === 'completed' 
                              ? "border-green-500 text-green-500" 
                              : "border-yellow-500 text-yellow-500"
                          }
                        >
                          {recharge.transactionstatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(recharge.rechargeid)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron recargas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
