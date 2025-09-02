"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"
import { MembersPage } from "@/components/members-page"
import { PointOfSalePage } from "@/components/point-of-sale-page"
import { ProductsPage } from "@/components/products-page"
import { Toaster } from "@/components/ui/toaster"
import { useProtectedRoute } from "@/lib/protected-route"

export type Page = "dashboard" | "members" | "pos" | "products"

export function MainLayout() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useProtectedRoute()

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "members":
        return <MembersPage />
      case "pos":
        return <PointOfSalePage />
      case "products":
        return <ProductsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user ? {
            name: user.nombre_completo || user.username,
            role: 'admin' // Por ahora fijo, se puede expandir en el futuro
          } : null}
          onLogout={logout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
      </div>

      <Toaster />
    </div>
  )
}
