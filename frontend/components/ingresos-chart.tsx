"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { IngresosChart } from "@/lib/types"

interface IngresosChartComponentProps {
    data: IngresosChart[]
    isLoading?: boolean
}

export function IngresosChartComponent({ data, isLoading }: IngresosChartComponentProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value)
    }

    const getTotalIngresos = () => {
        return data.reduce((total, item) => total + item.ingresos, 0)
    }

    const getPromedioDiario = () => {
        return data.length > 0 ? getTotalIngresos() / data.length : 0
    }

    const getTendencia = () => {
        if (data.length < 2) return { tipo: 'neutral', porcentaje: 0 }

        const primerosDias = data.slice(0, Math.floor(data.length / 2))
        const ultimosDias = data.slice(Math.floor(data.length / 2))

        const promedioInicial = primerosDias.reduce((sum, item) => sum + item.ingresos, 0) / primerosDias.length
        const promedioFinal = ultimosDias.reduce((sum, item) => sum + item.ingresos, 0) / ultimosDias.length

        const cambio = ((promedioFinal - promedioInicial) / promedioInicial) * 100

        return {
            tipo: cambio > 0 ? 'positiva' : cambio < 0 ? 'negativa' : 'neutral',
            porcentaje: Math.abs(cambio)
        }
    }

    const tendencia = getTendencia()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Análisis de Ingresos
                    </CardTitle>
                    <CardDescription>Cargando datos de ingresos...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Procesando datos...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Análisis de Ingresos
                    </CardTitle>
                    <CardDescription>No hay datos disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                                No hay datos de ingresos para mostrar
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Análisis de Ingresos (7 días)
                </CardTitle>
                <CardDescription>
                    Desglose detallado por membresías y productos
                </CardDescription>

                {/* Métricas Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <DollarSign className="h-5 w-5 mx-auto text-green-600 mb-1" />
                        <p className="text-sm font-medium">Total 7 días</p>
                        <p className="text-lg font-bold text-green-600">
                            {formatCurrency(getTotalIngresos())}
                        </p>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Calendar className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                        <p className="text-sm font-medium">Promedio diario</p>
                        <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(getPromedioDiario())}
                        </p>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        {tendencia.tipo === 'positiva' ? (
                            <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
                        ) : tendencia.tipo === 'negativa' ? (
                            <TrendingDown className="h-5 w-5 mx-auto text-red-600 mb-1" />
                        ) : (
                            <Calendar className="h-5 w-5 mx-auto text-gray-600 mb-1" />
                        )}
                        <p className="text-sm font-medium">Tendencia</p>
                        <div className="flex items-center justify-center gap-1">
                            <Badge
                                variant={tendencia.tipo === 'positiva' ? 'default' : tendencia.tipo === 'negativa' ? 'destructive' : 'secondary'}
                                className="text-xs"
                            >
                                {tendencia.tipo === 'positiva' ? '+' : tendencia.tipo === 'negativa' ? '-' : ''}
                                {tendencia.porcentaje.toFixed(1)}%
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer
                    config={{
                        total: {
                            label: "Total",
                            color: "hsl(220, 70%, 50%)", // Azul para la línea total
                        },
                        membresias: {
                            label: "Membresías",
                            color: "hsl(217, 91%, 60%)", // Azul para membresías
                        },
                        productos: {
                            label: "Productos",
                            color: "hsl(142, 69%, 58%)", // Verde para productos
                        },
                    }}
                    className="h-[300px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="dia" />
                            <YAxis />
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value, name) => [
                                        formatCurrency(Number(value)),
                                        name === 'membresias' ? 'Membresías' :
                                            name === 'productos' ? 'Productos' : 'Total'
                                    ]}
                                    labelFormatter={(label) => `Día: ${label}`}
                                />}
                            />
                            <Legend />
                            <Bar dataKey="membresias" fill="#3b82f6" name="Membresías" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="productos" fill="#10b981" name="Productos" radius={[2, 2, 0, 0]} />
                            <Line type="monotone" dataKey="ingresos" stroke="#6366f1" strokeWidth={2} name="Total" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
