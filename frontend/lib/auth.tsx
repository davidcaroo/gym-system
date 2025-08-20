'use client';

/**
 * Contexto de autenticación para manejo centralizado del estado de usuario
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/apiService';
import type { LoginRequest, LoginResponse } from '@/lib/types';

// === TIPOS DEL CONTEXTO ===

export interface User {
  id: number;
  username: string;
  nombre_completo?: string;
  activo?: boolean;
  ultimo_acceso?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  clearError: () => void;
}

// === ACTIONS ===

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; sessionId: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// === REDUCER ===

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        sessionId: action.payload.sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        sessionId: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        sessionId: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// === ESTADO INICIAL ===

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Empezamos en loading para verificar sesión
  sessionId: null,
  error: null,
};

// === CONTEXTO ===

const AuthContext = createContext<AuthContextType | null>(null);

// === PROVIDER ===

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Función para iniciar sesión
   */
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response: LoginResponse = await apiService.auth.login(credentials);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          sessionId: response.sessionId,
        },
      });

      // Guardar sessionId en localStorage para persistencia
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionId', response.sessionId);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      // Intentar logout en el servidor
      await apiService.auth.logout();
    } catch (error) {
      // Ignorar errores del servidor en logout
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar estado local siempre
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
      }
    }
  };

  /**
   * Verificar sesión existente
   */
  const verifySession = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Intentar verificar con el servidor
      const response: LoginResponse = await apiService.auth.verify();
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          sessionId: response.sessionId,
        },
      });

      // Actualizar localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionId', response.sessionId);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return true;
    } catch (error) {
      // Si falla la verificación, limpiar estado
      dispatch({ type: 'AUTH_LOGOUT' });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
      }

      return false;
    }
  };

  /**
   * Limpiar errores
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Verificar sesión al cargar la aplicación
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Verificar si hay datos en localStorage
      if (typeof window !== 'undefined') {
        const storedSessionId = localStorage.getItem('sessionId');
        const storedUser = localStorage.getItem('user');

        if (storedSessionId && storedUser) {
          // Hay sesión guardada, verificar con el servidor
          const isValid = await verifySession();
          if (!mounted) return;

          if (!isValid) {
            // Sesión inválida, marcar como no autenticado
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          // No hay sesión guardada
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        // No estamos en el cliente
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Verificar sesión periódicamente (cada 5 minutos)
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await verifySession();
      if (!isValid) {
        // Sesión expirada, redirigir al login se manejará por el ProtectedRoute
        console.warn('Sesión expirada');
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    verifySession,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// === HOOK PERSONALIZADO ===

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
}

// === COMPONENTE DE CARGA ===

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    </div>
  );
}
