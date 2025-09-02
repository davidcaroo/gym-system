"use client"

import React from 'react'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Toast individual
interface ToastProps {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    onRemove: (id: string) => void
}

function Toast({ id, type, title, message, onRemove }: ToastProps) {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isExiting, setIsExiting] = React.useState(false)

    const handleRemove = () => {
        setIsExiting(true)
        setTimeout(() => {
            setIsVisible(false)
            onRemove(id)
        }, 200)
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleRemove()
        }, 5000) // Auto-remove after 5 seconds

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    }

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400',
        error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-400',
        info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-400'
    }

    const iconStyles = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    }

    const Icon = icons[type]

    return (
        <div
            className={cn(
                'relative flex items-start gap-3 p-4 border rounded-lg shadow-lg transition-all duration-200 transform',
                styles[type],
                isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
                'animate-in slide-in-from-right-full'
            )}
        >
            <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[type])} />

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{title}</h4>
                {message && (
                    <p className="mt-1 text-sm opacity-90">{message}</p>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-black/10 dark:hover:bg-white/10"
                onClick={handleRemove}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    )
}

// Container de toasts
export function ToastContainer() {
    const { state, removeNotification } = useApp()

    if (state.notifications.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
            <div className="space-y-2 pointer-events-auto">
                {state.notifications.map((notification) => (
                    <Toast
                        key={notification.id}
                        id={notification.id}
                        type={notification.type}
                        title={notification.title}
                        message={notification.message}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </div>
    )
}

// Hook para usar toasts fácilmente
export function useToast() {
    const { showSuccess, showError, showWarning, showInfo } = useApp()

    return {
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo
    }
}

// Funciones utilitarias para toasts comunes
export const toast = {
    success: (title: string, message?: string) => {
        // Esta función será sobrescrita por el contexto
        console.log('Toast success:', title, message)
    },
    error: (title: string, message?: string) => {
        console.log('Toast error:', title, message)
    },
    warning: (title: string, message?: string) => {
        console.log('Toast warning:', title, message)
    },
    info: (title: string, message?: string) => {
        console.log('Toast info:', title, message)
    }
}

// Provider que configura las funciones de toast
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const { showSuccess, showError, showWarning, showInfo } = useApp()

    React.useEffect(() => {
        // Configurar las funciones globales de toast
        toast.success = showSuccess
        toast.error = showError
        toast.warning = showWarning
        toast.info = showInfo
    }, [showSuccess, showError, showWarning, showInfo])

    return (
        <>
            {children}
            <ToastContainer />
        </>
    )
}

// Componente Toast personalizable para casos específicos
interface CustomToastProps {
    title: string
    message?: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
    onClose?: () => void
}

export function CustomToast({
    title,
    message,
    type = 'info',
    duration = 5000,
    action,
    onClose
}: CustomToastProps) {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false)
                onClose?.()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    if (!isVisible) return null

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    }

    const Icon = icons[type]

    return (
        <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
                <Icon className={cn(
                    'w-5 h-5 mt-0.5 flex-shrink-0',
                    type === 'success' && 'text-green-500',
                    type === 'error' && 'text-red-500',
                    type === 'warning' && 'text-yellow-500',
                    type === 'info' && 'text-blue-500'
                )} />

                <div className="flex-1">
                    <h4 className="font-medium text-sm">{title}</h4>
                    {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}

                    {action && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => {
                        setIsVisible(false)
                        onClose?.()
                    }}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
