"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Edit, Trash2, Calendar, Phone, Mail, User } from "lucide-react"

interface Member {
  id: string
  nombre: string
  email: string
  telefono: string
  estado: "activo" | "inactivo" | "vencido"
  fechaVencimiento: string
  tipoMembresia: string
  foto: string
}

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan@email.com",
    telefono: "300-123-4567",
    estado: "activo",
    fechaVencimiento: "2025-09-15",
    tipoMembresia: "Mensual Premium",
    foto: "/abstract-profile.png",
  },
  {
    id: "2",
    nombre: "María García",
    email: "maria@email.com",
    telefono: "300-234-5678",
    estado: "vencido",
    fechaVencimiento: "2024-12-10",
    tipoMembresia: "Mensual Básico",
    foto: "/woman-profile.png",
  },
  {
    id: "3",
    nombre: "Carlos López",
    email: "carlos@email.com",
    telefono: "300-345-6789",
    estado: "activo",
    fechaVencimiento: "2025-10-20",
    tipoMembresia: "Anual Premium",
    foto: "/man-profile.png",
  },
  {
    id: "4",
    nombre: "Ana Rodríguez",
    email: "ana@email.com",
    telefono: "300-456-7890",
    estado: "inactivo",
    fechaVencimiento: "2025-08-05",
    tipoMembresia: "Mensual Básico",
    foto: "/woman-profile-2.png",
  },
]

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || member.estado === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-500"
      case "vencido":
        return "bg-red-500"
      case "inactivo":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "activo":
        return "Activo"
      case "vencido":
        return "Vencido"
      case "inactivo":
        return "Inactivo"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-montserrat">Gestión de Miembros</h1>
          <p className="text-muted-foreground">Administra los miembros de tu gimnasio</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Editar Miembro" : "Nuevo Miembro"}</DialogTitle>
              <DialogDescription>
                {editingMember ? "Modifica los datos del miembro" : "Completa la información del nuevo miembro"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" placeholder="Juan Pérez" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="juan@email.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="300-123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="membership">Tipo de Membresía</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una membresía" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual-basico">Mensual Básico</SelectItem>
                    <SelectItem value="mensual-premium">Mensual Premium</SelectItem>
                    <SelectItem value="anual-basico">Anual Básico</SelectItem>
                    <SelectItem value="anual-premium">Anual Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>{editingMember ? "Actualizar" : "Crear"} Miembro</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar miembros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={member.foto || "/placeholder.svg"}
                      alt={member.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.estado)}`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.nombre}</CardTitle>
                    <Badge
                      variant={
                        member.estado === "activo"
                          ? "default"
                          : member.estado === "vencido"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {getStatusText(member.estado)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Vence: {member.fechaVencimiento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{member.tipoMembresia}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingMember(member)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">No hay miembros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filterStatus !== "all"
              ? "No se encontraron miembros con los filtros aplicados."
              : "Comienza agregando tu primer miembro."}
          </p>
        </div>
      )}
    </div>
  )
}
