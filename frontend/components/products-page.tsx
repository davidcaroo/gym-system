"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle, TrendingDown, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiService } from "@/lib/apiService"

interface Product {
    id: number
    nombre: string
    codigo_barras?: string
    categoria: "suplementos" | "bebidas" | "accesorios" | "ropa"
    precio_compra?: number
    precio_venta: number
    stock_actual?: number
    stock_minimo?: number
    proveedor?: string
    fecha_vencimiento?: string
    descripcion?: string
    activo?: boolean
}

interface ProductStats {
    total_productos: number
    stock_bajo: number
    por_categoria: { categoria: string; cantidad: number }[]
    valor_inventario: number
}

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [stats, setStats] = useState<ProductStats | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [filterStock, setFilterStock] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Formulario
    const [formData, setFormData] = useState({
        nombre: "",
        codigo_barras: "",
        descripcion: "",
        categoria: "suplementos" as const,
        precio_compra: "",
        precio_venta: "",
        stock_actual: "",
        stock_minimo: "",
        proveedor: "",
        fecha_vencimiento: ""
    })

    // Cargar datos iniciales
    useEffect(() => {
        loadProducts()
        loadStats()
    }, [])

    const loadProducts = async () => {
        try {
            setIsLoading(true)
            const response = await apiService.products.getAll()
            setProducts(response)
        } catch (error: any) {
            toast({
                title: "Error al cargar productos",
                description: error.message || "No se pudieron cargar los productos",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const response = await apiService.products.getStats()
            setStats(response)
        } catch (error: any) {
            console.error('Error al cargar estadísticas:', error)
        }
    }

    // Crear producto
    const handleCreateProduct = async () => {
        try {
            setIsSubmitting(true)
            const productData = {
                nombre: formData.nombre,
                codigo_barras: formData.codigo_barras || undefined,
                descripcion: formData.descripcion || undefined,
                categoria: formData.categoria,
                precio_compra: formData.precio_compra ? Number(formData.precio_compra) : undefined,
                precio_venta: Number(formData.precio_venta),
                stock_actual: formData.stock_actual ? Number(formData.stock_actual) : 0,
                stock_minimo: formData.stock_minimo ? Number(formData.stock_minimo) : 5,
                proveedor: formData.proveedor || undefined,
                fecha_vencimiento: formData.fecha_vencimiento || undefined
            }

            await apiService.products.create(productData)

            toast({
                title: "Producto creado",
                description: `${formData.nombre} se ha creado exitosamente`,
            })

            resetForm()
            setIsDialogOpen(false)
            loadProducts() // Recargar lista
            loadStats() // Actualizar estadísticas
        } catch (error: any) {
            toast({
                title: "Error al crear producto",
                description: error.message || "No se pudo crear el producto",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Editar producto
    const handleEditProduct = async () => {
        if (!editingProduct) return

        try {
            setIsSubmitting(true)
            const productData = {
                nombre: formData.nombre,
                codigo_barras: formData.codigo_barras || undefined,
                descripcion: formData.descripcion || undefined,
                categoria: formData.categoria,
                precio_compra: formData.precio_compra ? Number(formData.precio_compra) : undefined,
                precio_venta: Number(formData.precio_venta),
                stock_actual: formData.stock_actual ? Number(formData.stock_actual) : undefined,
                stock_minimo: formData.stock_minimo ? Number(formData.stock_minimo) : undefined,
                proveedor: formData.proveedor || undefined,
                fecha_vencimiento: formData.fecha_vencimiento || undefined
            }

            await apiService.products.update(editingProduct.id, productData)

            toast({
                title: "Producto actualizado",
                description: `${formData.nombre} se ha actualizado exitosamente`,
            })

            resetForm()
            setIsDialogOpen(false)
            setEditingProduct(null)
            loadProducts() // Recargar lista
            loadStats() // Actualizar estadísticas
        } catch (error: any) {
            toast({
                title: "Error al actualizar producto",
                description: error.message || "No se pudo actualizar el producto",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Eliminar producto
    const handleDeleteProduct = async (product: Product) => {
        try {
            await apiService.products.delete(product.id)

            toast({
                title: "Producto eliminado",
                description: `${product.nombre} se ha eliminado exitosamente`,
            })

            loadProducts() // Recargar lista
            loadStats() // Actualizar estadísticas
        } catch (error: any) {
            toast({
                title: "Error al eliminar producto",
                description: error.message || "No se pudo eliminar el producto",
                variant: "destructive",
            })
        }
    }

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            codigo_barras: "",
            descripcion: "",
            categoria: "suplementos",
            precio_compra: "",
            precio_venta: "",
            stock_actual: "",
            stock_minimo: "",
            proveedor: "",
            fecha_vencimiento: ""
        })
    }

    // Llenar formulario para edición
    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            nombre: product.nombre || "",
            codigo_barras: product.codigo_barras || "",
            descripcion: product.descripcion || "",
            categoria: product.categoria,
            precio_compra: product.precio_compra?.toString() || "",
            precio_venta: product.precio_venta.toString(),
            stock_actual: product.stock_actual?.toString() || "",
            stock_minimo: product.stock_minimo?.toString() || "",
            proveedor: product.proveedor || "",
            fecha_vencimiento: product.fecha_vencimiento || ""
        })
        setIsDialogOpen(true)
    }

    // Manejar envío del formulario
    const handleSubmit = () => {
        if (editingProduct) {
            handleEditProduct()
        } else {
            handleCreateProduct()
        }
    }

    // Filtrar productos
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.codigo_barras && product.codigo_barras.includes(searchTerm))
        const matchesCategory = filterCategory === "all" || product.categoria === filterCategory
        const matchesStock =
            filterStock === "all" ||
            (filterStock === "low" && (product.stock_actual || 0) <= (product.stock_minimo || 0)) ||
            (filterStock === "out" && (product.stock_actual || 0) === 0)
        return matchesSearch && matchesCategory && matchesStock
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(price)
    }

    const getStockStatus = (product: Product) => {
        const stock = product.stock_actual || 0
        const minStock = product.stock_minimo || 0

        if (stock === 0) return { status: "out", color: "destructive", text: "Agotado" }
        if (stock <= minStock) return { status: "low", color: "secondary", text: "Stock Bajo" }
        return { status: "ok", color: "default", text: "Disponible" }
    }

    const lowStockCount = products.filter((p) => (p.stock_actual || 0) <= (p.stock_minimo || 0) && (p.stock_actual || 0) > 0).length
    const outOfStockCount = products.filter((p) => (p.stock_actual || 0) === 0).length

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-montserrat">Inventario de Productos</h1>
                    <p className="text-muted-foreground">Gestiona el inventario y precios de productos</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingProduct(null)
                            resetForm()
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? "Modifica los datos del producto." : "Completa los datos para crear un nuevo producto."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del producto *</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="Ej: Proteína Whey"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="codigo_barras">Código de barras</Label>
                                    <Input
                                        id="codigo_barras"
                                        placeholder="Ej: 7891234567890"
                                        value={formData.codigo_barras}
                                        onChange={(e) => setFormData(prev => ({ ...prev, codigo_barras: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    placeholder="Descripción del producto..."
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoría *</Label>
                                    <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value as any }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="suplementos">Suplementos</SelectItem>
                                            <SelectItem value="bebidas">Bebidas</SelectItem>
                                            <SelectItem value="accesorios">Accesorios</SelectItem>
                                            <SelectItem value="ropa">Ropa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="proveedor">Proveedor</Label>
                                    <Input
                                        id="proveedor"
                                        placeholder="Ej: Suplementos Colombia"
                                        value={formData.proveedor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="precio_compra">Precio de compra</Label>
                                    <Input
                                        id="precio_compra"
                                        type="number"
                                        placeholder="35000"
                                        value={formData.precio_compra}
                                        onChange={(e) => setFormData(prev => ({ ...prev, precio_compra: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="precio_venta">Precio de venta *</Label>
                                    <Input
                                        id="precio_venta"
                                        type="number"
                                        placeholder="55000"
                                        value={formData.precio_venta}
                                        onChange={(e) => setFormData(prev => ({ ...prev, precio_venta: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_actual">Stock actual</Label>
                                    <Input
                                        id="stock_actual"
                                        type="number"
                                        placeholder="10"
                                        value={formData.stock_actual}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock_minimo">Stock mínimo</Label>
                                    <Input
                                        id="stock_minimo"
                                        type="number"
                                        placeholder="5"
                                        value={formData.stock_minimo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_vencimiento">Fecha vencimiento</Label>
                                    <Input
                                        id="fecha_vencimiento"
                                        type="date"
                                        value={formData.fecha_vencimiento}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingProduct ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_productos}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.valor_inventario)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                <SelectItem value="suplementos">Suplementos</SelectItem>
                                <SelectItem value="bebidas">Bebidas</SelectItem>
                                <SelectItem value="accesorios">Accesorios</SelectItem>
                                <SelectItem value="ropa">Ropa</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStock} onValueChange={setFilterStock}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Estado stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="low">Stock bajo</SelectItem>
                                <SelectItem value="out">Agotados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de productos */}
            <Card>
                <CardHeader>
                    <CardTitle>Productos ({filteredProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Precio Compra</TableHead>
                                    <TableHead>Precio Venta</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product)
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{product.nombre}</div>
                                                    {product.codigo_barras && (
                                                        <div className="text-sm text-muted-foreground">{product.codigo_barras}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{product.categoria}</Badge>
                                            </TableCell>
                                            <TableCell>{product.precio_compra ? formatPrice(product.precio_compra) : "-"}</TableCell>
                                            <TableCell className="font-medium">{formatPrice(product.precio_venta)}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{product.stock_actual || 0} unidades</div>
                                                    <div className="text-muted-foreground">Min: {product.stock_minimo || 0}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                                            </TableCell>
                                            <TableCell>{product.proveedor || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteProduct(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">No hay productos</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {searchTerm || filterCategory !== "all" || filterStock !== "all"
                            ? "No se encontraron productos con los filtros aplicados."
                            : "Comienza agregando tu primer producto."}
                    </p>
                </div>
            )}
        </div>
    )
}
