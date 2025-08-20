"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { DEFAULT_PROTECTED_ROUTE } from "@/lib/protected-route"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si está autenticado, redirigir al dashboard
        router.push(DEFAULT_PROTECTED_ROUTE)
      } else {
        // Si no está autenticado, redirigir al login
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Página de carga mientras se determina el estado
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
