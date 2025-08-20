'use client';

/**
 * Componente para proteger rutas que requieren autenticación
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AuthLoading } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!isLoading && !isAuthenticated) {
      // Guardar la ruta actual para redirigir después del login
      if (pathname !== '/login') {
        localStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Mostrar loading mientras verifica la sesión
  if (isLoading) {
    return <AuthLoading />;
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}

/**
 * Hook para usar información de rutas protegidas
 */
export function useProtectedRoute() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    user,
    logout: handleLogout,
    requireAuth,
  };
}

/**
 * Rutas que no requieren autenticación
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/register', // Si lo implementas en el futuro
  '/forgot-password', // Si lo implementas en el futuro
];

/**
 * Rutas por defecto después del login
 */
export const DEFAULT_PROTECTED_ROUTE = '/dashboard';

/**
 * Componente para rutas públicas (que redirigen si ya está autenticado)
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Si ya está autenticado, redirigir al dashboard
      const redirectTo = localStorage.getItem('redirectAfterLogin') || DEFAULT_PROTECTED_ROUTE;
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return <AuthLoading />;
  }

  // Si está autenticado, no mostrar nada (se redirigirá)
  if (isAuthenticated) {
    return null;
  }

  // Si no está autenticado, mostrar el contenido (login page)
  return <>{children}</>;
}
