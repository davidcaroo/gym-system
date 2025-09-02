"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Tipos para el estado global
export interface AppState {
    isLoading: boolean
    error: string | null
    notifications: Notification[]
    sidebarOpen: boolean
    theme: 'light' | 'dark' | 'system'
}

export interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

// Tipos de acciones
type AppAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_SIDEBAR'; payload: boolean }
    | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
    | { type: 'CLEAR_ERROR' }

// Estado inicial
const initialState: AppState = {
    isLoading: false,
    error: null,
    notifications: [],
    sidebarOpen: true,
    theme: 'system'
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }

        case 'SET_ERROR':
            return { ...state, error: action.payload }

        case 'CLEAR_ERROR':
            return { ...state, error: null }

        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, action.payload]
            }

        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            }

        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarOpen: !state.sidebarOpen }

        case 'SET_SIDEBAR':
            return { ...state, sidebarOpen: action.payload }

        case 'SET_THEME':
            return { ...state, theme: action.payload }

        default:
            return state
    }
}

// Context
interface AppContextType {
    state: AppState
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
    toggleSidebar: () => void
    setSidebar: (open: boolean) => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    showSuccess: (title: string, message?: string) => void
    showError: (title: string, message?: string) => void
    showWarning: (title: string, message?: string) => void
    showInfo: (title: string, message?: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider
interface AppProviderProps {
    children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, dispatch] = useReducer(appReducer, initialState)

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading })
    }

    const setError = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error })
    }

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' })
    }

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: { ...notification, id }
        })

        // Auto-remove notification after duration
        const duration = notification.duration || 5000
        setTimeout(() => {
            removeNotification(id)
        }, duration)
    }

    const removeNotification = (id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    }

    const toggleSidebar = () => {
        dispatch({ type: 'TOGGLE_SIDEBAR' })
    }

    const setSidebar = (open: boolean) => {
        dispatch({ type: 'SET_SIDEBAR', payload: open })
    }

    const setTheme = (theme: 'light' | 'dark' | 'system') => {
        dispatch({ type: 'SET_THEME', payload: theme })
    }

    // Helper functions for common notifications
    const showSuccess = (title: string, message?: string) => {
        addNotification({ type: 'success', title, message })
    }

    const showError = (title: string, message?: string) => {
        addNotification({ type: 'error', title, message })
    }

    const showWarning = (title: string, message?: string) => {
        addNotification({ type: 'warning', title, message })
    }

    const showInfo = (title: string, message?: string) => {
        addNotification({ type: 'info', title, message })
    }

    const value: AppContextType = {
        state,
        setLoading,
        setError,
        clearError,
        addNotification,
        removeNotification,
        toggleSidebar,
        setSidebar,
        setTheme,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook personalizado
export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
