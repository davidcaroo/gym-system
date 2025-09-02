"use client"

import React from 'react'
import { useApp } from '@/lib/app-context'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { useLoading, LoadingCard, LoadingSkeleton, LoadingOverlay } from '@/lib/loading'
import { SimpleErrorBoundary } from '@/lib/error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function TestContextPage() {
    const { state, setLoading, toggleSidebar, setTheme } = useApp()
    const { user } = useAuth()
    const toast = useToast()
    const { isLoading, startLoading, stopLoading } = useLoading()

    const handleTestToasts = () => {
        toast.success('¡Éxito!', 'Esta es una notificación de éxito')
        setTimeout(() => {
            toast.info('Información', 'Esta es una notificación informativa')
        }, 500)
        setTimeout(() => {
            toast.warning('Advertencia', 'Esta es una notificación de advertencia')
        }, 1000)
        setTimeout(() => {
            toast.error('Error', 'Esta es una notificación de error')
        }, 1500)
    }

    const handleTestLoading = () => {
        startLoading()
        setTimeout(() => {
            stopLoading()
            toast.success('Carga completada', 'El test de loading ha terminado')
        }, 3000)
    }

    const handleTestError = () => {
        throw new Error('Error de prueba para el Error Boundary')
    }

    const handleGlobalLoading = () => {
        state.isLoading ? setLoading(false) : setLoading(true)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">🧪 Test de Contextos y Estado Global</h1>
                <p className="text-muted-foreground mt-2">
                    Prueba todos los sistemas de estado, notificaciones y manejo de errores
                </p>
            </div>

            {/* Estado de Autenticación */}
            <Card>
                <CardHeader>
                    <CardTitle>🔐 Estado de Autenticación</CardTitle>
                    <CardDescription>
                        Información del usuario y estado de autenticación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant={user ? "default" : "secondary"}>
                            {user ? "Autenticado" : "No autenticado"}
                        </Badge>
                        {user && <span className="text-sm">Usuario: {user.username}</span>}
                    </div>
                </CardContent>
            </Card>

            {/* Estado Global de la App */}
            <Card>
                <CardHeader>
                    <CardTitle>🌐 Estado Global de la App</CardTitle>
                    <CardDescription>
                        Control del estado global de la aplicación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Loading Global:</p>
                            <Badge variant={state.isLoading ? "destructive" : "secondary"}>
                                {state.isLoading ? "Cargando" : "Inactivo"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Sidebar:</p>
                            <Badge variant={state.sidebarOpen ? "default" : "secondary"}>
                                {state.sidebarOpen ? "Abierto" : "Cerrado"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Tema:</p>
                            <Badge variant="outline">{state.theme}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Notificaciones:</p>
                            <Badge variant="outline">{state.notifications.length}</Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleGlobalLoading} size="sm">
                            Toggle Loading Global
                        </Button>
                        <Button onClick={toggleSidebar} size="sm" variant="outline">
                            Toggle Sidebar
                        </Button>
                        <Button onClick={() => setTheme('dark')} size="sm" variant="outline">
                            Tema Oscuro
                        </Button>
                        <Button onClick={() => setTheme('light')} size="sm" variant="outline">
                            Tema Claro
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Test de Notificaciones */}
            <Card>
                <CardHeader>
                    <CardTitle>🔔 Sistema de Notificaciones</CardTitle>
                    <CardDescription>
                        Prueba las notificaciones toast
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleTestToasts} variant="default">
                            Mostrar Todas las Notificaciones
                        </Button>
                        <Button onClick={() => toast.success('¡Éxito!', 'Operación completada')} variant="outline">
                            Success
                        </Button>
                        <Button onClick={() => toast.error('Error', 'Algo salió mal')} variant="outline">
                            Error
                        </Button>
                        <Button onClick={() => toast.warning('Advertencia', 'Ten cuidado')} variant="outline">
                            Warning
                        </Button>
                        <Button onClick={() => toast.info('Info', 'Información importante')} variant="outline">
                            Info
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Test de Loading States */}
            <Card>
                <CardHeader>
                    <CardTitle>🔄 Estados de Carga</CardTitle>
                    <CardDescription>
                        Prueba los diferentes componentes de carga
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={handleTestLoading} disabled={isLoading}>
                            {isLoading ? 'Cargando...' : 'Test Loading (3s)'}
                        </Button>
                    </div>

                    <LoadingOverlay isLoading={state.isLoading} message="Loading global activo...">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LoadingCard message="Cargando datos..." rows={3} />
                            <div>
                                <h4 className="font-medium mb-2">Loading Skeleton:</h4>
                                <LoadingSkeleton rows={3} />
                            </div>
                        </div>
                    </LoadingOverlay>

                    {isLoading && (
                        <div className="p-4 border rounded-lg">
                            <p className="text-center text-muted-foreground">
                                Estado de loading local activo...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test de Error Boundary */}
            <Card>
                <CardHeader>
                    <CardTitle>🛡️ Error Boundary</CardTitle>
                    <CardDescription>
                        Prueba el manejo de errores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SimpleErrorBoundary>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Este botón causará un error que será capturado por el Error Boundary:
                            </p>
                            <Button onClick={handleTestError} variant="destructive">
                                🚨 Causar Error de Prueba
                            </Button>
                        </div>
                    </SimpleErrorBoundary>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
                <CardHeader>
                    <CardTitle>📊 Estado Actual del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">✅</p>
                            <p className="text-sm">AuthContext</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">✅</p>
                            <p className="text-sm">AppContext</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">✅</p>
                            <p className="text-sm">Error Boundary</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">✅</p>
                            <p className="text-sm">Toast System</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
