"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Package, Activity, TrendingUp, AlertTriangle, Eye, RotateCcw } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { LoadingSpinner } from "@/lib/loading"
import { useToast } from "@/lib/toast"
import { apiService } from "@/lib/apiService"
import { DashboardStats } from "@/lib/types"

// Datos estáticos que se mantienen (se pueden hacer dinámicos después)
const chartData = [
  { day: "Lun", ingresos: 2400 },
  { day: "Mar", ingresos: 1800 },
  { day: "Mié", ingresos: 3200 },
  { day: "Jue", ingresos: 2800 },
  { day: "Vie", ingresos: 3600 },
  { day: "Sáb", ingresos: 4200 },
  { day: "Dom", ingresos: 2100 },
]

const recentActivity = [
  { id: 1, type: "venta", description: "Venta de Proteína Whey - Juan Pérez", amount: "$45.000", time: "10:30 AM" },
  { id: 2, type: "miembro", description: "Nuevo miembro registrado - María García", amount: "", time: "09:15 AM" },
  {
    id: 3,
    type: "venta",
    description: "Venta de Bebida Energética - Carlos López",
    amount: "$8.500",
    time: "08:45 AM",
  },
  { id: 4, type: "miembro", description: "Renovación membresía - Ana Rodríguez", amount: "$120.000", time: "08:20 AM" },
  { id: 5, type: "venta", description: "Venta de Toalla - Pedro Martín", amount: "$25.000", time: "07:55 AM" },
]

const alerts = [
  { id: 1, type: "stock", message: "Proteína Whey Gold - Stock bajo (3 unidades)", priority: "high" },
  { id: 2, type: "vencimiento", message: "5 membresías vencen esta semana", priority: "medium" },
  { id: 3, type: "producto", message: "Creatina Monohidrato vence en 15 días", priority: "low" },
]

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const toast = useToast()

  // Función para cargar los datos del dashboard
  const loadDashboardData = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const data = await apiService.reports.getDashboardStats()
      setDashboardData(data)

      if (showRefreshMessage) {
        toast.success('Dashboard actualizado', 'Los datos se han actualizado correctamente')
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Error al cargar dashboard', 'No se pudieron obtener las estadísticas')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Función para formatear números como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Función para calcular productos con stock bajo (simulado por ahora)
  const getStockBajo = () => {
    return 8 // Por ahora hardcoded, después se puede conectar con productos
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-montserrat">Dashboard</h1>
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-montserrat">Dashboard</h1>
          <p className="text-muted-foreground text-red-500">Error al cargar los datos</p>
        </div>

        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No se pudieron cargar las estadísticas</p>
          <Button onClick={() => loadDashboardData()}>
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-montserrat">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu gimnasio</p>
        </div>

        <Button
          onClick={() => loadDashboardData(true)}
          variant="outline"
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Cards - DATOS REALES manteniendo diseño original */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.miembros_activos}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{dashboardData.nuevos_miembros_mes}</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.ingresos_mes_actual)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={dashboardData.crecimiento_ingresos >= 0 ? "text-green-600" : "text-red-600"}>
                {dashboardData.crecimiento_ingresos >= 0 ? '+' : ''}{dashboardData.crecimiento_ingresos.toFixed(1)}%
              </span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getStockBajo()}</div>
            <p className="text-xs text-muted-foreground">Productos requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos del Mes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_accesos_mes}</div>
            <p className="text-xs text-muted-foreground">Total de accesos este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ingresos Últimos 7 Días
            </CardTitle>
            <CardDescription>Evolución de ingresos diarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ingresos: {
                  label: "Ingresos",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas transacciones y eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <Badge variant="outline" className="ml-auto font-mono">
                      {activity.amount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas y Notificaciones
          </CardTitle>
          <CardDescription>Elementos que requieren tu atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${alert.priority === "high"
                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                    : alert.priority === "medium"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                      : "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle
                    className={`h-4 w-4 ${alert.priority === "high"
                        ? "text-red-600"
                        : alert.priority === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                  />
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
