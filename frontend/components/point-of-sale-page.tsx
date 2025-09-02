"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, DollarSign, User } from "lucide-react"

interface Product {
  id: string
  nombre: string
  precio: number
  stock: number
  categoria: string
  imagen: string
}

interface CartItem extends Product {
  cantidad: number
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    nombre: "Proteína Whey Gold",
    precio: 45000,
    stock: 12,
    categoria: "suplementos",
    imagen: "/placeholder-alkxy.png",
  },
  {
    id: "2",
    nombre: "Creatina Monohidrato",
    precio: 35000,
    stock: 8,
    categoria: "suplementos",
    imagen: "/creatine-supplement.png",
  },
  {
    id: "3",
    nombre: "Bebida Energética",
    precio: 8500,
    stock: 25,
    categoria: "bebidas",
    imagen: "/vibrant-energy-drink.png",
  },
  {
    id: "4",
    nombre: "Toalla Deportiva",
    precio: 25000,
    stock: 15,
    categoria: "accesorios",
    imagen: "/placeholder-71l48.png",
  },
  {
    id: "5",
    nombre: "Shaker Premium",
    precio: 18000,
    stock: 20,
    categoria: "accesorios",
    imagen: "/placeholder-g345i.png",
  },
  {
    id: "6",
    nombre: "Camiseta GymPro",
    precio: 32000,
    stock: 10,
    categoria: "ropa",
    imagen: "/gym-shirt.png",
  },
]

export function PointOfSalePage() {
  const [products] = useState<Product[]>(MOCK_PRODUCTS)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [memberSearch, setMemberSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const categories = ["all", "suplementos", "bebidas", "accesorios", "ropa"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: Math.min(item.cantidad + 1, product.stock) } : item,
        )
      }
      return [...prev, { ...product, cantidad: 1 }]
    })
  }

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id)
      return
    }

    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, cantidad } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const descuento = selectedMember ? subtotal * 0.1 : 0 // 10% descuento para miembros
  const total = subtotal - descuento

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const processSale = () => {
    if (cart.length === 0) return

    // Aquí iría la lógica para procesar la venta
    alert("Venta procesada exitosamente!")
    setCart([])
    setSelectedMember(null)
    setMemberSearch("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-montserrat">Punto de Venta</h1>
        <p className="text-muted-foreground">Procesa ventas de productos y servicios</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={product.imagen || "/placeholder.svg"}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">{product.nombre}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.precio)}</span>
                      <Badge variant={product.stock > 5 ? "default" : "destructive"}>Stock: {product.stock}</Badge>
                    </div>

                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          {/* Member Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder="Buscar miembro..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {selectedMember && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Juan Pérez (10% desc.)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(null)
                        setMemberSearch("")
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {!selectedMember && memberSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setSelectedMember("1")}
                  >
                    Seleccionar: Juan Pérez
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">El carrito está vacío</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.precio)} c/u</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center text-sm">{item.cantidad}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total and Checkout */}
          {cart.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {descuento > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento miembro:</span>
                      <span>-{formatPrice(descuento)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Efectivo
                        </div>
                      </SelectItem>
                      <SelectItem value="tarjeta">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Tarjeta
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={processSale} className="w-full">
                    Procesar Venta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
