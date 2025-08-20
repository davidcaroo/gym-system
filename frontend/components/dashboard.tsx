"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Package, Activity, TrendingUp, AlertTriangle, Eye } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-montserrat">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu gimnasio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.450.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-muted-foreground">Productos requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Miembros en el gimnasio</p>
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
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(value as number),
                          "Ingresos",
                        ]}
                      />
                    }
                  />
                  <Bar dataKey="ingresos" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas transacciones y eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && <Badge variant="secondary">{activity.amount}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas y Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      alert.priority === "high"
                        ? "bg-red-500"
                        : alert.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm">{alert.message}</span>
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
