"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, ShoppingCart, Package, Dumbbell, X } from "lucide-react"
import type { Page } from "@/components/main-layout"

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { id: "dashboard" as Page, name: "Dashboard", icon: LayoutDashboard },
  { id: "members" as Page, name: "Miembros", icon: Users },
  { id: "pos" as Page, name: "Punto de Venta", icon: ShoppingCart },
  { id: "products" as Page, name: "Productos", icon: Package },
]

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-sidebar-primary rounded-lg">
                <Dumbbell className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-montserrat text-sidebar-foreground">GymPro</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    onPageChange(item.id)
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
