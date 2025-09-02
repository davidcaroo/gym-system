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
import { Textarea } from "@/components/ui/textarea"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    CreditCard,
    Clock,
    Loader2,
    Package,
    RefreshCw,
    DollarSign
} from "lucide-react"
import { useToast } from "@/lib/toast"
import { apiService } from "@/lib/apiService"
import { LoadingSpinner } from "@/lib/loading"
import type { Membership, MembershipRequest } from "@/lib/types"

// Formulario para crear/editar membresía
interface MembershipFormData {
    nombre: string
    descripcion: string
    precio: number
    duracion_dias: number
}

export function MembershipsPage() {
    // Estado principal
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [allMemberships, setAllMemberships] = useState<Membership[]>([]) // Lista completa
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
    const [membershipToDelete, setMembershipToDelete] = useState<Membership | null>(null)
    const toast = useToast()

    // Formulario
    const [formData, setFormData] = useState<MembershipFormData>({
        nombre: "",
        descripcion: "",
        precio: 0,
        duracion_dias: 0,
    })

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        setIsLoading(true)
        try {
            const membershipsData = await apiService.memberships.getAll()
            setAllMemberships(membershipsData)
            setMemberships(membershipsData)
        } catch (error) {
            toast.error("Error", "No se pudieron cargar las membresías")
        } finally {
            setIsLoading(false)
        }
    }

    // Función para actualizar con mensaje
    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const membershipsData = await apiService.memberships.getAll()
            setAllMemberships(membershipsData)
            setMemberships(membershipsData)
            setSearchTerm("") // Limpiar búsqueda

            toast.success(
                "Listado actualizado",
                "Lista de membresías actualizada correctamente"
            )
        } catch (error) {
            toast.error("Error", "No se pudo actualizar la lista")
        } finally {
            setIsRefreshing(false)
        }
    }

    // Filtrado dinámico de membresías (búsqueda local instantánea)
    const filteredMemberships = allMemberships.filter((membership) => {
        const searchLower = searchTerm.toLowerCase()
        return searchTerm === "" ||
            membership.nombre.toLowerCase().includes(searchLower) ||
            membership.descripcion?.toLowerCase().includes(searchLower)
    })

    // Actualizar la lista mostrada cuando cambia la búsqueda
    useEffect(() => {
        setMemberships(filteredMemberships)
    }, [searchTerm, allMemberships])

    // Manejar cambios en el formulario
    const handleFormChange = (field: keyof MembershipFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Crear nueva membresía
    const handleCreateMembership = async () => {
        if (!formData.nombre || formData.precio <= 0 || formData.duracion_dias <= 0) {
            toast.error("Error", "Nombre, precio y duración son obligatorios")
            return
        }

        setIsSubmitting(true)
        try {
            const membershipData: MembershipRequest = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: formData.precio,
                duracion_dias: formData.duracion_dias
            }

            const newMembership = await apiService.memberships.create(membershipData)
            setAllMemberships(prev => [newMembership, ...prev])
            setMemberships(prev => [newMembership, ...prev])

            toast.success(
                "Membresía creada",
                "La membresía se ha creado correctamente"
            )

            resetForm()
            setIsDialogOpen(false)
        } catch (error: any) {
            toast.error("Error", error.message || "No se pudo crear la membresía")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Actualizar membresía
    const handleUpdateMembership = async () => {
        if (!editingMembership || !formData.nombre || formData.precio <= 0 || formData.duracion_dias <= 0) {
            toast.error("Error", "Nombre, precio y duración son obligatorios")
            return
        }

        setIsSubmitting(true)
        try {
            const membershipData: Partial<MembershipRequest> = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: formData.precio,
                duracion_dias: formData.duracion_dias
            }

            const updatedMembership = await apiService.memberships.update(editingMembership.id!, membershipData)
            setAllMemberships(prev =>
                prev.map(membership =>
                    membership.id === editingMembership.id ? updatedMembership : membership
                )
            )
            setMemberships(prev =>
                prev.map(membership =>
                    membership.id === editingMembership.id ? updatedMembership : membership
                )
            )

            toast.success(
                "Membresía actualizada",
                "Los datos se han actualizado correctamente"
            )

            resetForm()
            setIsDialogOpen(false)
            setEditingMembership(null)
        } catch (error: any) {
            toast.error("Error", error.message || "No se pudo actualizar la membresía")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Eliminar membresía
    const handleDeleteMembership = async () => {
        if (!membershipToDelete) return

        try {
            await apiService.memberships.delete(membershipToDelete.id!)
            setAllMemberships(prev => prev.filter(membership => membership.id !== membershipToDelete.id))
            setMemberships(prev => prev.filter(membership => membership.id !== membershipToDelete.id))

            toast.success("Membresía eliminada", "La membresía se ha eliminado correctamente")
        } catch (error: any) {
            toast.error("Error", error.message || "No se pudo eliminar la membresía")
        } finally {
            setMembershipToDelete(null)
        }
    }

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: 0,
            duracion_dias: 0,
        })
    }

    // Abrir diálogo para editar
    const openEditDialog = (membership: Membership) => {
        setEditingMembership(membership)
        setFormData({
            nombre: membership.nombre || "",
            descripcion: membership.descripcion || "",
            precio: membership.precio || 0,
            duracion_dias: membership.duracion_dias || 0,
        })
        setIsDialogOpen(true)
    }

    // Abrir diálogo para crear
    const openCreateDialog = () => {
        setEditingMembership(null)
        resetForm()
        setIsDialogOpen(true)
    }

    // Formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // Formatear duración
    const formatDuration = (days: number) => {
        if (days === 1) return "1 día"
        if (days < 30) return `${days} días`
        if (days === 30) return "1 mes"
        if (days < 365) {
            const months = Math.round(days / 30)
            return `${months} ${months === 1 ? 'mes' : 'meses'}`
        }
        const years = Math.round(days / 365)
        return `${years} ${years === 1 ? 'año' : 'años'}`
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

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Membresías</h1>
                    <p className="text-muted-foreground">
                        Administra los tipos de membresías del gimnasio
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
                                Nueva Membresía
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMembership ? "Editar Membresía" : "Nueva Membresía"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingMembership
                                        ? "Modifica los datos de la membresía"
                                        : "Completa los datos para crear una nueva membresía"
                                    }
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => handleFormChange("nombre", e.target.value)}
                                        placeholder="Ej: Mensual, Trimestral, Anual"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Textarea
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => handleFormChange("descripcion", e.target.value)}
                                        placeholder="Describe los beneficios de esta membresía"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="precio">Precio *</Label>
                                        <Input
                                            id="precio"
                                            type="number"
                                            value={formData.precio}
                                            onChange={(e) => handleFormChange("precio", parseFloat(e.target.value) || 0)}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duracion_dias">Duración (días) *</Label>
                                        <Input
                                            id="duracion_dias"
                                            type="number"
                                            value={formData.duracion_dias}
                                            onChange={(e) => handleFormChange("duracion_dias", parseInt(e.target.value) || 0)}
                                            placeholder="30"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false)
                                        setEditingMembership(null)
                                        resetForm()
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={editingMembership ? handleUpdateMembership : handleCreateMembership}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingMembership ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Lista de membresías */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMemberships.length === 0 ? (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">No hay membresías</h3>
                                <p className="text-muted-foreground text-center">
                                    {searchTerm
                                        ? "No se encontraron membresías que coincidan con la búsqueda"
                                        : "Aún no hay membresías registradas. ¡Crea la primera!"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    filteredMemberships.map((membership) => (
                        <Card key={membership.id} className="overflow-hidden border border-gray-200 hover:shadow-sm transition-shadow">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{membership.nombre}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    Activa
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    {membership.descripcion && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {membership.descripcion}
                                        </p>
                                    )}

                                    {/* Precio y duración */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                                            <DollarSign className="h-5 w-5" />
                                            <span>{formatPrice(membership.precio)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>Duración: {formatDuration(membership.duracion_dias)}</span>
                                        </div>
                                        {membership.created_at && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>Creada: {formatDate(membership.created_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(membership)}
                                            className="flex-1"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMembershipToDelete(membership)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Diálogo de confirmación para eliminar */}
            <AlertDialog open={!!membershipToDelete} onOpenChange={() => setMembershipToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la membresía "{membershipToDelete?.nombre}".
                            Los miembros con esta membresía no podrán usarla nuevamente.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteMembership}
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
