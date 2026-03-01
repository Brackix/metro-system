"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, Plus, Pencil, Trash2, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import * as stationService from "@/app/routes/stations"

// ✅ Importa los componentes del mapa con dynamic import
const InteractiveMap = dynamic(
  () => import("@/components/interactive-map").then(mod => ({ default: mod.InteractiveMap })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-[600px]">Cargando mapa...</div>
  }
)

const StationFormMap = dynamic(
  () => import("@/components/station-form-map").then(mod => ({ default: mod.StationFormMap })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Cargando mapa...</div>
  }
)

interface Station {
  stationid: number
  code: number
  name: string
  line: string
  address: string | null
  active: boolean
  lat: number | null
  lng: number | null
}

export default function StationList() {
  const [stations, setStations] = useState<Station[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [deletingStation, setDeletingStation] = useState<Station | null>(null)
  const [showMapView, setShowMapView] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    line: "L1",
    address: "",
    active: true,
    lat: 18.4861,
    lng: -69.9312,
  })

  // Fetch stations
  const fetchStations = async () => {
    try {
      setIsLoading(true)
      const response = await stationService.getStations()
      console.log('Fetched stations:', response.data)
      setStations(response.data || [])
    } catch (error) {
      console.error("Error fetching stations:", error)
      setStations([])
    } finally {
      setIsLoading(false)
    }
  }

  // Search stations
  const searchStationsFunc = async (query: string) => {
    if (!query.trim()) {
      fetchStations()
      return
    }
    
    try {
      const response = await stationService.searchStations(query)
      console.log('Search results:', response.data)
      setStations(response.data || [])
    } catch (error) {
      console.error("Error searching stations:", error)
      setStations([])
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStationsFunc(searchQuery)
    }, 300)
    
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng
    }))
  }

  const handleLineChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      line: value
    }))
  }

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }))
  }

  // Create or Update station
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      alert("Por favor ingresa el nombre de la estación")
      return
    }
    
    const payload = {
      name: formData.name.trim(),
      line: formData.line,
      address: formData.address.trim() || null,
      active: formData.active,
      lat: formData.lat,
      lng: formData.lng,
    }

    console.log('Submitting station:', payload)

    try {
      if (editingStation) {
        const response = await stationService.updateStation(editingStation.stationid.toString(), payload)
        console.log('✅ Station updated:', response.data)
      } else {
        const response = await stationService.createStation(payload)
        console.log('✅ Station created:', response.data)
      }
      
      await fetchStations()
      closeDialog()
    } catch (error: any) {
      console.error("❌ Error saving station:", error)
      console.error("Error details:", error.response?.data)
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'No se pudo guardar la estación. Verifica tu conexión con el backend.'
      
      alert(`Error: ${errorMessage}`)
    }
  }

  // Delete station
  const handleDelete = async () => {
    if (!deletingStation) return

    try {
      await stationService.deleteStation(deletingStation.stationid.toString())
      
      fetchStations()
      setIsDeleteDialogOpen(false)
      setDeletingStation(null)
    } catch (error) {
      console.error("Error deleting station:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingStation(null)
    setFormData({ 
      name: "", 
      line: "Línea 1", 
      address: "",
      active: true,
      lat: 18.4861,
      lng: -69.9312 
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (station: Station) => {
    setEditingStation(station)
    setFormData({
      name: station.name,
      line: station.line,
      address: station.address || "",
      active: station.active,
      lat: station.lat || 18.4861,
      lng: station.lng || -69.9312,
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (station: Station) => {
    setDeletingStation(station)
    setIsDeleteDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingStation(null)
  }

  const getLineColor = (line: string) => {
    if (line.includes("1")) return "bg-red-500"
    if (line.includes("2")) return "bg-blue-500"
    return "bg-gray-500"
  }

  const handleCreateFromMap = (lat: number, lng: number) => {
    setFormData({
      name: "",
      line: "L1",
      address: "",
      active: true,
      lat,
      lng
    })
    setEditingStation(null)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando estaciones...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, código o línea..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Estación
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando <strong>{stations.length}</strong> estaciones
      </div>

      {showMapView ? (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm p-3 bg-muted rounded-md">
            <div className="flex items-center gap-4">
              <span className="font-medium">Leyenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                <span>Línea 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                <span>Línea 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                <span>Otras</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Haz clic en el mapa para crear una nueva estación</span>
            </div>
          </div>
          <div className="rounded-md border overflow-hidden relative h-[600px]">
            <InteractiveMap
              stations={stations}
              onEditStation={openEditDialog}
              onDeleteStation={openDeleteDialog}
              onCreateStation={handleCreateFromMap}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Código</TableHead>
                <TableHead className="min-w-[150px]">Nombre</TableHead>
                <TableHead className="min-w-[100px]">Línea</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="hidden md:table-cell min-w-[200px]">Dirección</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">Coordenadas</TableHead>
                <TableHead className="text-right w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron estaciones
                  </TableCell>
                </TableRow>
              ) : (
                stations.map((station) => (
                  <TableRow key={station.stationid}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{station.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{station.name}</span>
                        <span className="md:hidden text-xs text-muted-foreground mt-1">
                          {station.address || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getLineColor(station.line)}`} />
                        <span className="whitespace-nowrap">{station.line}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={station.active ? "default" : "secondary"}
                        className={station.active ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"}
                      >
                        {station.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {station.address || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {station.lat && station.lng
                        ? `${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(station)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDeleteDialog(station)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStation ? "Editar Estación" : "Nueva Estación"}
            </DialogTitle>
            <DialogDescription>
              {editingStation
                ? "Modifica la información de la estación."
                : "Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la Estación *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Centro de los Héroes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="line">Línea del Metro *</Label>
                  <Select value={formData.line} onValueChange={handleLineChange}>
                    <SelectTrigger id="line">
                      <SelectValue placeholder="Selecciona una línea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Línea 1">Línea 1</SelectItem>
                      <SelectItem value="Línea 2">Línea 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    placeholder="Ej: Av. Máximo Gómez, Santo Domingo"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="active" className="flex items-center justify-between">
                    <span>Estado de la Estación</span>
                  </Label>
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={handleActiveChange}
                    />
                    <Label htmlFor="active" className="cursor-pointer font-normal">
                      {formData.active ? (
                        <span className="text-green-600 font-medium">✓ Activa</span>
                      ) : (
                        <span className="text-gray-500">✗ Inactiva</span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación en el Mapa
                </Label>
                <div className="w-full h-64 sm:h-80 rounded-md border overflow-hidden">
                  {isDialogOpen && (
                    <StationFormMap
                      lat={formData.lat}
                      lng={formData.lng}
                      onLocationChange={handleLocationChange}
                    />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  🖱️ <strong>Haz clic en el mapa</strong> o <strong>arrastra el marcador verde</strong> para seleccionar la ubicación exacta
                </div>
                <div className="flex gap-4 text-xs font-mono bg-muted p-2 rounded">
                  <span className="font-semibold">Lat: {formData.lat.toFixed(6)}</span>
                  <span className="font-semibold">Lng: {formData.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingStation ? "Guardar Cambios" : "Crear Estación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              ¿Eliminar estación?
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la siguiente estación:
            </DialogDescription>
          </DialogHeader>
          
          {deletingStation && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{deletingStation.name}</span>
                <Badge 
                  variant={deletingStation.active ? "default" : "secondary"}
                  className={deletingStation.active ? "bg-green-500" : "bg-gray-400"}
                >
                  {deletingStation.active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <span className="ml-2 font-medium">{deletingStation.code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Línea:</span>
                  <span className="ml-2 font-medium">{deletingStation.line}</span>
                </div>
                {deletingStation.address && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span className="ml-2 font-medium">{deletingStation.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingStation(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
