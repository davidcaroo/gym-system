"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, Edit, Trash2, Calendar, Phone, Mail, User, Loader2, UserX, RefreshCw, CheckCircle } from "lucide-react"
import { useToast } from "@/lib/toast"
import { apiService } from "@/lib/apiService"
import { LoadingSpinner } from "@/lib/loading"
import type { Member, Membership, MemberRequest } from "@/lib/types"

// Formulario para crear/editar miembro
interface MemberFormData {
  nombre: string
  email: string
  telefono: string
  documento: string
  fecha_nacimiento: string
  tipo_membresia_id: number
  direccion: string
  contacto_emergencia: string
  telefono_emergencia: string
}

export function MembersPage() {
  // Estado principal
  const [members, setMembers] = useState<Member[]>([])
  const [allMembers, setAllMembers] = useState<Member[]>([]) // Nueva lista completa
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false) // Nuevo estado para actualizar
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const toast = useToast()

  // Formulario
  const [formData, setFormData] = useState<MemberFormData>({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    fecha_nacimiento: "",
    tipo_membresia_id: 0,
    direccion: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [membersData, membershipsData] = await Promise.all([
        apiService.members.getAll(),
        apiService.memberships.getAll()
      ])

      setAllMembers(membersData) // Guardar lista completa
      setMembers(membersData) // Mostrar lista inicial
      setMemberships(membershipsData)
    } catch (error) {
      toast.error("Error", "No se pudieron cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  // Nueva función para actualizar con mensaje
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [membersData, membershipsData] = await Promise.all([
        apiService.members.getAll(),
        apiService.memberships.getAll()
      ])

      setAllMembers(membersData)
      setMembers(membersData)
      setMemberships(membershipsData)
      setSearchTerm("") // Limpiar búsqueda
      setFilterStatus("all") // Resetear filtro

      toast.success(
        "Listado actualizado",
        "Lista de usuarios actualizada correctamente"
      )
    } catch (error) {
      toast.error("Error", "No se pudo actualizar la lista")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filtrado dinámico de miembros (búsqueda local instantánea)
  const filteredMembers = allMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === "" ||
      member.nombre.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.documento?.toLowerCase().includes(searchLower) ||
      member.telefono?.toLowerCase().includes(searchLower)

    const matchesFilter = filterStatus === "all" || member.estado === filterStatus
    return matchesSearch && matchesFilter
  })

  // Actualizar la lista mostrada cuando cambia la búsqueda o filtro
  useEffect(() => {
    setMembers(filteredMembers)
  }, [searchTerm, filterStatus, allMembers])

  // Manejar cambios en el formulario
  const handleFormChange = (field: keyof MemberFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Crear nuevo miembro
  const handleCreateMember = async () => {
    if (!formData.nombre || !formData.documento) {
      toast.error("Error", "Nombre y documento son obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      const memberData = {
        ...formData,
        tipo_membresia_id: formData.tipo_membresia_id > 0 ? formData.tipo_membresia_id : undefined
      }

      const newMember = await apiService.members.create(memberData)
      setAllMembers(prev => [newMember, ...prev])
      setMembers(prev => [newMember, ...prev])

      toast.success(
        "Miembro creado",
        "El miembro se ha creado correctamente"
      )

      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast.error("Error", error.message || "No se pudo crear el miembro")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Actualizar miembro
  const handleUpdateMember = async () => {
    if (!editingMember || !formData.nombre || !formData.documento) {
      toast.error("Error", "Nombre y documento son obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      const memberData = {
        ...formData,
        tipo_membresia_id: formData.tipo_membresia_id > 0 ? formData.tipo_membresia_id : undefined
      }

      const updatedMember = await apiService.members.update(editingMember.id!, memberData)
      setAllMembers(prev =>
        prev.map(member =>
          member.id === editingMember.id ? updatedMember : member
        )
      )
      setMembers(prev =>
        prev.map(member =>
          member.id === editingMember.id ? updatedMember : member
        )
      )

      toast.success(
        "Miembro actualizado",
        "Los datos se han actualizado correctamente"
      )

      resetForm()
      setIsDialogOpen(false)
      setEditingMember(null)
    } catch (error: any) {
      toast.error("Error", error.message || "No se pudo actualizar el miembro")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar miembro
  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    try {
      await apiService.members.delete(memberToDelete.id!)
      setAllMembers(prev => prev.filter(member => member.id !== memberToDelete.id))
      setMembers(prev => prev.filter(member => member.id !== memberToDelete.id))

      toast.success("Miembro eliminado", "El miembro se ha eliminado correctamente")
    } catch (error: any) {
      toast.error("Error", error.message || "No se pudo eliminar el miembro")
    } finally {
      setMemberToDelete(null)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      documento: "",
      fecha_nacimiento: "",
      tipo_membresia_id: 0,
      direccion: "",
      contacto_emergencia: "",
      telefono_emergencia: "",
    })
  }

  // Abrir diálogo para editar
  const openEditDialog = (member: Member) => {
    setEditingMember(member)
    setFormData({
      nombre: member.nombre || "",
      email: member.email || "",
      telefono: member.telefono || "",
      documento: member.documento || "",
      fecha_nacimiento: member.fecha_nacimiento?.split('T')[0] || "",
      tipo_membresia_id: member.tipo_membresia_id || 0,
      direccion: member.direccion || "",
      contacto_emergencia: member.contacto_emergencia || "",
      telefono_emergencia: member.telefono_emergencia || "",
    })
    setIsDialogOpen(true)
  }

  // Abrir diálogo para crear
  const openCreateDialog = () => {
    setEditingMember(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-500"
      case "suspendido":
        return "bg-red-500"
      case "inactivo":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('es-CO')
    } catch {
      return "N/A"
    }
  }

  // Obtener nombre de membresía
  const getMembershipName = (membershipId?: number) => {
    const membership = memberships.find(m => m.id === membershipId)
    return membership?.nombre || "Sin membresía"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Miembros</h1>
          <p className="text-muted-foreground">
            Administra los miembros del gimnasio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Editar Miembro" : "Nuevo Miembro"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Modifica los datos del miembro"
                    : "Completa los datos para crear un nuevo miembro"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleFormChange("nombre", e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento *</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => handleFormChange("documento", e.target.value)}
                    placeholder="Cédula o documento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleFormChange("telefono", e.target.value)}
                    placeholder="300-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleFormChange("fecha_nacimiento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_membresia_id">Tipo de Membresía</Label>
                  <Select
                    value={formData.tipo_membresia_id.toString()}
                    onValueChange={(value) => handleFormChange("tipo_membresia_id", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar membresía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin membresía</SelectItem>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id!.toString()}>
                          {membership.nombre} - ${membership.precio?.toLocaleString('es-CO')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleFormChange("direccion", e.target.value)}
                    placeholder="Dirección completa"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
                  <Input
                    id="contacto_emergencia"
                    value={formData.contacto_emergencia}
                    onChange={(e) => handleFormChange("contacto_emergencia", e.target.value)}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono_emergencia">Teléfono de Emergencia</Label>
                  <Input
                    id="telefono_emergencia"
                    value={formData.telefono_emergencia}
                    onChange={(e) => handleFormChange("telefono_emergencia", e.target.value)}
                    placeholder="300-123-4567"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingMember(null)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingMember ? handleUpdateMember : handleCreateMember}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingMember ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="suspendido">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay miembros</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? "No se encontraron miembros que coincidan con la búsqueda"
                    : "Aún no hay miembros registrados. ¡Crea el primero!"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden border border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.nombre}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${member.estado === 'activo' ? 'bg-green-500' :
                          member.estado === 'inactivo' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                        <Badge
                          variant={member.estado === 'activo' ? 'default' : 'secondary'}
                          className={`text-xs ${member.estado === 'activo' ? 'bg-blue-600 text-white' :
                            member.estado === 'inactivo' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                            }`}
                        >
                          {member.estado === 'activo' ? 'Activo' :
                            member.estado === 'inactivo' ? 'Inactivo' : 'Suspendido'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{member.telefono}</span>
                    </div>
                  )}
                  {member.fecha_registro && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Registro: {formatDate(member.fecha_registro)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <User className="h-4 w-4" />
                    <span>{getMembershipName(member.tipo_membresia_id)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMemberToDelete(member)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el miembro "{memberToDelete?.nombre}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
