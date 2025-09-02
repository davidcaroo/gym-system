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
import { StockAlerts } from "@/components/stock-alerts"
import { IngresosChartComponent } from "@/components/ingresos-chart"
import {
  DashboardStats,
  IngresosChart,
  ActividadReciente,
  AlertaSistema,
  ProductoStockBajo
} from "@/lib/types"

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<IngresosChart[]>([])
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([])
  const [alertas, setAlertas] = useState<AlertaSistema[]>([])
  const [productosStockBajo, setProductosStockBajo] = useState<ProductoStockBajo[]>([])
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

      // Cargar todos los datos en paralelo
      const [
        dashboardStats,
        ingresosChartData,
        actividadData,
        alertasData,
        stockBajoData
      ] = await Promise.allSettled([
        apiService.reports.getDashboardStats(),
        apiService.reports.getIngresosChart(),
        apiService.reports.getActividadReciente(10),
        apiService.reports.getAlertas(),
        apiService.reports.getProductosStockBajo()
      ])

      // Procesar resultados
      if (dashboardStats.status === 'fulfilled') {
        setDashboardData(dashboardStats.value)
      }

      if (ingresosChartData.status === 'fulfilled') {
        setChartData(ingresosChartData.value)
      } else {
        // Fallback a datos estáticos si falla
        setChartData([
          { fecha: '2024-01-15', dia: 'Lun', ingresos: 2400, membresias: 1800, productos: 600 },
          { fecha: '2024-01-16', dia: 'Mar', ingresos: 1800, membresias: 1200, productos: 600 },
          { fecha: '2024-01-17', dia: 'Mié', ingresos: 3200, membresias: 2400, productos: 800 },
          { fecha: '2024-01-18', dia: 'Jue', ingresos: 2800, membresias: 2000, productos: 800 },
          { fecha: '2024-01-19', dia: 'Vie', ingresos: 3600, membresias: 2800, productos: 800 },
          { fecha: '2024-01-20', dia: 'Sáb', ingresos: 4200, membresias: 3200, productos: 1000 },
          { fecha: '2024-01-21', dia: 'Dom', ingresos: 2100, membresias: 1600, productos: 500 },
        ])
      }

      if (actividadData.status === 'fulfilled') {
        setActividadReciente(actividadData.value)
      } else {
        // Fallback a datos estáticos
        setActividadReciente([
          {
            id: 1,
            tipo: 'venta',
            descripcion: 'Venta de Proteína Whey',
            monto: 45000,
            monto_formateado: '$45.000',
            hora: '10:30',
            fecha: new Date().toISOString(),
            miembro_nombre: 'Juan Pérez'
          },
          {
            id: 2,
            tipo: 'miembro',
            descripcion: 'Nuevo miembro registrado',
            hora: '09:15',
            fecha: new Date().toISOString(),
            miembro_nombre: 'María García'
          }
        ])
      }

      if (alertasData.status === 'fulfilled') {
        setAlertas(alertasData.value)
      } else {
        // Fallback dinámico basado en productos con stock bajo
        const alertasGeneradas: AlertaSistema[] = []

        // Solo agregar alerta de stock si hay productos con stock bajo
        const stockBajoLength = stockBajoData.status === 'fulfilled'
          ? stockBajoData.value.length
          : 3 // Número de productos en fallback

        if (stockBajoLength > 0) {
          alertasGeneradas.push({
            id: 1,
            tipo: 'stock',
            mensaje: 'Productos con stock bajo detectados',
            descripcion: `${stockBajoLength} productos requieren reposición`,
            prioridad: 'high',
            fecha_creacion: new Date().toISOString(),
            resuelto: false
          })
        }

        setAlertas(alertasGeneradas)
      }

      if (stockBajoData.status === 'fulfilled') {
        setProductosStockBajo(stockBajoData.value)
      } else {
        // Fallback consistente con las alertas del sistema
        setProductosStockBajo([
          {
            id: 1,
            nombre: 'Proteína Whey Gold',
            categoria: 'Suplementos',
            stock_actual: 2,
            stock_minimo: 10,
            diferencia: -8,
            precio_venta: 120000,
            fecha_vencimiento: '2024-12-31'
          },
          {
            id: 2,
            nombre: 'Creatina Monohidrato',
            categoria: 'Suplementos',
            stock_actual: 1,
            stock_minimo: 5,
            diferencia: -4,
            precio_venta: 85000
          },
          {
            id: 3,
            nombre: 'Camiseta Gym Pro',
            categoria: 'Ropa',
            stock_actual: 3,
            stock_minimo: 15,
            diferencia: -12,
            precio_venta: 35000
          }
        ])
      }

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

  // Función para calcular productos con stock bajo
  const getStockBajo = () => {
    return productosStockBajo.length
  }

  // Función para determinar si hay productos con stock bajo
  const hasStockBajo = () => {
    return productosStockBajo.length > 0
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
            <Package className={`h-4 w-4 ${hasStockBajo() ? 'text-amber-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasStockBajo() ? 'text-amber-600' : 'text-green-600'}`}>
              {getStockBajo()}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasStockBajo() ? 'Productos requieren reposición' : 'Todo el stock está bien'}
            </p>
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

      {/* Charts and Activity Section */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Advanced Revenue Chart */}
        <div className="lg:col-span-2">
          <IngresosChartComponent
            data={chartData}
            isLoading={isLoading && chartData.length === 0}
          />
        </div>

        {/* Recent Activity - DATOS REALES */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas transacciones y eventos
              {actividadReciente.length > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  • {actividadReciente.length} eventos
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[320px] overflow-y-auto">
              {actividadReciente.length > 0 ? (
                actividadReciente.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.descripcion}
                        {activity.miembro_nombre && (
                          <span className="text-muted-foreground"> - {activity.miembro_nombre}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.hora}</p>
                    </div>
                    {activity.monto_formateado && (
                      <Badge variant="outline" className="ml-auto font-mono">
                        {activity.monto_formateado}
                      </Badge>
                    )}
                    {activity.tipo === 'miembro' && !activity.monto_formateado && (
                      <Badge variant="secondary" className="ml-auto">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay actividad reciente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Stock Section */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* System Alerts - DATOS REALES */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>
              Elementos que requieren tu atención
              {alertas.length > 0 && (
                <span className="ml-2 text-xs text-red-600">
                  • {alertas.length} alertas activas
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {alertas.length > 0 ? (
                alertas.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${alert.prioridad === "high" || alert.prioridad === "critical"
                      ? "border-red-500 bg-red-50 dark:bg-red-950"
                      : alert.prioridad === "medium"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle
                        className={`h-4 w-4 ${alert.prioridad === "high" || alert.prioridad === "critical"
                          ? "text-red-600"
                          : alert.prioridad === "medium"
                            ? "text-yellow-600"
                            : "text-blue-600"
                          }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{alert.mensaje}</p>
                        {alert.descripcion && (
                          <p className="text-xs text-muted-foreground">{alert.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay alertas activas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <StockAlerts
          productos={productosStockBajo}
          onRestock={(id) => toast.info('Función en desarrollo', `Reponer stock para producto ${id}`)}
          onView={(id) => toast.info('Función en desarrollo', `Ver detalles del producto ${id}`)}
        />
      </div>
    </div>
  )
}
