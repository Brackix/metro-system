"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Plus, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import * as userService from "@/app/routes/users"

interface User {
  userid: number
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string
  passwordhash: string
}

interface UserFormData {
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string
  passwordhash: string
}

interface CurrentUser {
  name?: string
  role?: string
}

interface UserDataGridProps {
  currentUser: CurrentUser | null
}

export function UserDataGrid({ currentUser }: UserDataGridProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUserEdit, setCurrentUserEdit] = useState<User | null>(null)
  const [editedUser, setEditedUser] = useState<UserFormData>({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    passwordhash: "",
  })

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<UserFormData>({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    passwordhash: "",
  })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await userService.getUsers()
      console.log('✅ Usuarios cargados:', response.data)
      setUsers(response.data || [])
    } catch (error) {
      console.error("❌ Error fetching users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (user: User) => {
    setCurrentUserEdit(user)
    setEditedUser({
      username: user.username || "",
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      phone: user.phone || "",
      passwordhash: user.passwordhash || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!currentUserEdit) return

    try {
      await userService.updateUser(currentUserEdit.userid, editedUser)
      console.log('✅ Usuario actualizado')
      await fetchUsers()
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("❌ Error updating user:", error)
      alert("Error al actualizar usuario: " + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await userService.deleteUser(userToDelete.userid)
      console.log('✅ Usuario eliminado')
      await fetchUsers()
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("❌ Error deleting user:", error)
      alert("Error al eliminar usuario: " + (error.response?.data?.message || error.message))
    }
  }

  const handleAddUser = () => {
    setNewUser({
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      passwordhash: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveNewUser = async () => {
    try {
      await userService.createUser(newUser)
      console.log('✅ Usuario creado')
      await fetchUsers()
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("❌ Error creating user:", error)
      alert("Error al crear usuario: " + (error.response?.data?.message || error.message))
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  return (
    // ✅ Eliminé "space-y-4" - Ahora sin espacio entre elementos
    <div>
      {/* Header - Margen bottom manual */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, apellido, correo o usuario..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {currentUser?.role === "Admin" && (
          <Button onClick={handleAddUser} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Contador - Margen bottom manual */}
      <div className="text-sm text-muted-foreground mb-4">
        Mostrando <strong>{filteredUsers.length}</strong> usuarios
      </div>

      {/* Tabla - Sin margin extra */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Usuario</TableHead>
              <TableHead className="min-w-[150px]">Nombre</TableHead>
              <TableHead className="min-w-[150px]">Apellido</TableHead>
              <TableHead className="min-w-[200px]">Correo</TableHead>
              <TableHead className="hidden md:table-cell min-w-[140px]">Teléfono</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userid}>
                  <TableCell className="font-medium">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{user.firstname}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentUser?.role === "Admin" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs sin cambios */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Realice cambios en el perfil de usuario aquí.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstname">Nombre</Label>
              <Input
                id="firstname"
                value={editedUser.firstname}
                onChange={(e) => setEditedUser({ ...editedUser, firstname: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input
                id="lastname"
                value={editedUser.lastname}
                onChange={(e) => setEditedUser({ ...editedUser, lastname: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={editedUser.phone}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={editedUser.passwordhash}
                onChange={(e) => setEditedUser({ ...editedUser, passwordhash: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" /> Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el siguiente usuario:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {userToDelete && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="font-semibold text-lg">{userToDelete.firstname} {userToDelete.lastname}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Usuario:</span>
                  <span className="ml-2 font-medium">{userToDelete.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 font-medium">{userToDelete.email}</span>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Permanentemente
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
            <DialogDescription>Ingrese los detalles para el nuevo usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-username">Usuario</Label>
              <Input
                id="new-username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-firstname">Nombre</Label>
              <Input
                id="new-firstname"
                value={newUser.firstname}
                onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-lastname">Apellido</Label>
              <Input
                id="new-lastname"
                value={newUser.lastname}
                onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-email">Correo</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-phone">Teléfono</Label>
              <Input
                id="new-phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.passwordhash}
                onChange={(e) => setNewUser({ ...newUser, passwordhash: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveNewUser} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Añadir Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
