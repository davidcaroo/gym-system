"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // Here you could also send the error to an error reporting service
        this.setState({
            error,
            errorInfo
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                            <CardTitle className="text-destructive">
                                ¡Algo salió mal!
                            </CardTitle>
                            <CardDescription>
                                Ha ocurrido un error inesperado en la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                                    <strong>Error:</strong> {this.state.error.message}
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer">Stack trace</summary>
                                            <pre className="mt-1 text-xs">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleReset}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reintentar
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    className="flex-1"
                                >
                                    Recargar Página
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Si el problema persiste, contacta al administrador.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

// Hook for functional components to trigger error boundary
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null)

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    const captureError = React.useCallback((error: Error) => {
        setError(error)
    }, [])

    React.useEffect(() => {
        if (error) {
            throw error
        }
    }, [error])

    return { captureError, resetError }
}

// Simple error boundary for specific components
interface SimpleErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function SimpleErrorBoundary({
    children,
    fallback,
    onError
}: SimpleErrorBoundaryProps) {
    return (
        <ErrorBoundary
            fallback={
                fallback || (
                    <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Error al cargar este componente</span>
                        </div>
                    </div>
                )
            }
        >
            {children}
        </ErrorBoundary>
    )
}
