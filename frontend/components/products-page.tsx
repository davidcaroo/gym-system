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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle, TrendingDown } from "lucide-react"

interface Product {
  id: string
  nombre: string
  codigoBarras: string
  categoria: "suplementos" | "bebidas" | "accesorios" | "ropa"
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  proveedor: string
  fechaVencimiento?: string
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    nombre: "Proteína Whey Gold",
    codigoBarras: "7891234567890",
    categoria: "suplementos",
    precioCompra: 35000,
    precioVenta: 45000,
    stock: 12,
    stockMinimo: 5,
    proveedor: "NutriSupplements",
    fechaVencimiento: "2025-12-15",
  },
  {
    id: "2",
    nombre: "Creatina Monohidrato",
    codigoBarras: "7891234567891",
    categoria: "suplementos",
    precioCompra: 25000,
    precioVenta: 35000,
    stock: 3,
    stockMinimo: 5,
    proveedor: "NutriSupplements",
    fechaVencimiento: "2026-06-20",
  },
  {
    id: "3",
    nombre: "Bebida Energética",
    codigoBarras: "7891234567892",
    categoria: "bebidas",
    precioCompra: 6000,
    precioVenta: 8500,
    stock: 25,
    stockMinimo: 10,
    proveedor: "EnergyDrinks Co",
    fechaVencimiento: "2025-03-10",
  },
  {
    id: "4",
    nombre: "Toalla Deportiva",
    codigoBarras: "7891234567893",
    categoria: "accesorios",
    precioCompra: 18000,
    precioVenta: 25000,
    stock: 15,
    stockMinimo: 8,
    proveedor: "SportGear",
  },
  {
    id: "5",
    nombre: "Shaker Premium",
    codigoBarras: "7891234567894",
    categoria: "accesorios",
    precioCompra: 12000,
    precioVenta: 18000,
    stock: 20,
    stockMinimo: 10,
    proveedor: "SportGear",
  },
  {
    id: "6",
    nombre: "Camiseta GymPro",
    codigoBarras: "7891234567895",
    categoria: "ropa",
    precioCompra: 22000,
    precioVenta: 32000,
    stock: 2,
    stockMinimo: 5,
    proveedor: "TextilSport",
  },
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStock, setFilterStock] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || product.codigoBarras.includes(searchTerm)
    const matchesCategory = filterCategory === "all" || product.categoria === filterCategory
    const matchesStock =
      filterStock === "all" ||
      (filterStock === "low" && product.stock <= product.stockMinimo) ||
      (filterStock === "out" && product.stock === 0)
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
    if (product.stock === 0) return { status: "out", color: "destructive", text: "Agotado" }
    if (product.stock <= product.stockMinimo) return { status: "low", color: "secondary", text: "Stock Bajo" }
    return { status: "ok", color: "default", text: "Disponible" }
  }

  const lowStockCount = products.filter((p) => p.stock <= p.stockMinimo && p.stock > 0).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-montserrat">Inventario de Productos</h1>
          <p className="text-muted-foreground">Gestiona el inventario y precios de productos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modifica los datos del producto" : "Completa la información del nuevo producto"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del producto</Label>
                <Input id="name" placeholder="Proteína Whey Gold" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="barcode">Código de barras</Label>
                <Input id="barcode" placeholder="7891234567890" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suplementos">Suplementos</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                    <SelectItem value="accesorios">Accesorios</SelectItem>
                    <SelectItem value="ropa">Ropa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="buyPrice">Precio de compra</Label>
                  <Input id="buyPrice" type="number" placeholder="35000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sellPrice">Precio de venta</Label>
                  <Input id="sellPrice" type="number" placeholder="45000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock actual</Label>
                  <Input id="stock" type="number" placeholder="12" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Stock mínimo</Label>
                  <Input id="minStock" type="number" placeholder="5" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input id="supplier" placeholder="NutriSupplements" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry">Fecha de vencimiento (opcional)</Label>
                <Input id="expiry" type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>{editingProduct ? "Actualizar" : "Crear"} Producto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Sin stock disponible</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
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
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Agotados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
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
                        <div className="text-sm text-muted-foreground">{product.codigoBarras}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.categoria}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(product.precioCompra)}</TableCell>
                    <TableCell className="font-medium">{formatPrice(product.precioVenta)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{product.stock} unidades</div>
                        <div className="text-muted-foreground">Min: {product.stockMinimo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                    </TableCell>
                    <TableCell>{product.proveedor}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 && (
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
