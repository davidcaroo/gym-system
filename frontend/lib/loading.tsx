"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Loading Spinner básico
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    }

    return (
        <Loader2
            className={cn(
                'animate-spin text-primary',
                sizeClasses[size],
                className
            )}
        />
    )
}

// Loading Page completo
interface LoadingPageProps {
    message?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function LoadingPage({
    message = 'Cargando...',
    size = 'lg'
}: LoadingPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <LoadingSpinner size={size} />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    )
}

// Loading Card para secciones
interface LoadingCardProps {
    message?: string
    className?: string
    rows?: number
}

export function LoadingCard({
    message = 'Cargando...',
    className,
    rows = 3
}: LoadingCardProps) {
    return (
        <div className={cn('p-6 border rounded-lg bg-card', className)}>
            <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">{message}</span>
                </div>

                {/* Skeleton rows */}
                <div className="space-y-2">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 bg-muted rounded animate-pulse"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Loading Skeleton para listas
interface LoadingSkeletonProps {
    rows?: number
    className?: string
}

export function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// Loading Button
interface LoadingButtonProps {
    isLoading: boolean
    children: React.ReactNode
    loadingText?: string
    className?: string
    [key: string]: any
}

export function LoadingButton({
    isLoading,
    children,
    loadingText,
    className,
    ...props
}: LoadingButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center',
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {isLoading ? (loadingText || 'Cargando...') : children}
        </button>
    )
}

// Loading Overlay para modales o secciones
interface LoadingOverlayProps {
    isLoading: boolean
    message?: string
    children: React.ReactNode
    className?: string
}

export function LoadingOverlay({
    isLoading,
    message = 'Cargando...',
    children,
    className
}: LoadingOverlayProps) {
    return (
        <div className={cn('relative', className)}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center space-y-2">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm text-muted-foreground">{message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// Loading Table para tablas de datos
interface LoadingTableProps {
    columns: number
    rows?: number
    className?: string
}

export function LoadingTable({
    columns,
    rows = 5,
    className
}: LoadingTableProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {/* Header */}
            <div className="flex space-x-4 pb-2 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={i}
                        className="h-4 bg-muted rounded animate-pulse flex-1"
                    />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex space-x-4 py-2">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="h-4 bg-muted rounded animate-pulse flex-1"
                            style={{
                                width: colIndex === 0 ? '20%' : 'auto',
                                opacity: Math.random() * 0.5 + 0.5
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

// Hook para estados de carga
export function useLoading(initialState = false) {
    const [isLoading, setIsLoading] = React.useState(initialState)

    const startLoading = React.useCallback(() => setIsLoading(true), [])
    const stopLoading = React.useCallback(() => setIsLoading(false), [])
    const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), [])

    return {
        isLoading,
        startLoading,
        stopLoading,
        toggleLoading,
        setIsLoading
    }
}

// Hook para loading con async operations
export function useAsyncLoading() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<Error | null>(null)

    const execute = React.useCallback(async <T,>(
        asyncFn: () => Promise<T>
    ): Promise<T | null> => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await asyncFn()
            return result
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isLoading,
        error,
        execute,
        clearError: () => setError(null)
    }
}
