"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Plus, Eye } from "lucide-react"
import { ProductoStockBajo } from "@/lib/types"

interface StockAlertsProps {
    productos: ProductoStockBajo[]
    onRestock?: (productoId: number) => void
    onView?: (productoId: number) => void
}

export function StockAlerts({ productos, onRestock, onView }: StockAlertsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getPriorityColor = (diferencia: number) => {
        if (diferencia <= 0) return "destructive" // Sin stock
        if (diferencia <= 2) return "destructive" // Crítico
        if (diferencia <= 5) return "secondary" // Medio
        return "outline" // Bajo
    }

    const getPriorityText = (diferencia: number) => {
        if (diferencia <= 0) return "SIN STOCK"
        if (diferencia <= 2) return "CRÍTICO"
        if (diferencia <= 5) return "BAJO"
        return "ATENCIÓN"
    }

    if (productos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Stock de Productos
                    </CardTitle>
                    <CardDescription>Todos los productos tienen stock suficiente</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                            ✅ No hay productos con stock bajo
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Productos con Stock Bajo
                </CardTitle>
                <CardDescription>
                    {productos.length} producto{productos.length > 1 ? 's' : ''} necesita{productos.length > 1 ? 'n' : ''} reposición
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {productos.map((producto) => (
                        <div
                            key={producto.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-card"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-12 rounded-full bg-amber-500" />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm">{producto.nombre}</h4>
                                        <Badge variant={getPriorityColor(producto.diferencia)} className="text-xs">
                                            {getPriorityText(producto.diferencia)}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Categoría: {producto.categoria}</span>
                                        <span>•</span>
                                        <span>Stock: {producto.stock_actual}/{producto.stock_minimo}</span>
                                        <span>•</span>
                                        <span>Precio: {formatCurrency(producto.precio_venta)}</span>
                                    </div>

                                    {producto.fecha_vencimiento && (
                                        <div className="mt-1">
                                            <span className="text-xs text-amber-600">
                                                ⚠️ Vence: {new Date(producto.fecha_vencimiento).toLocaleDateString('es-CO')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onView?.(producto.id)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onRestock?.(producto.id)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Reponer
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {productos.length > 5 && (
                    <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                            Ver todos los productos ({productos.length})
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
