"use client"

import { useState } from "react"
import { LoginPage } from "@/components/login-page"
import { MainLayout } from "@/components/main-layout"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  const handleLogin = (username: string, password: string) => {
    // Mock authentication - in real app this would call an API
    if (username === "admin" && password === "admin") {
      setUser({ name: "Administrador", role: "admin" })
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <MainLayout user={user} onLogout={handleLogout} />
}
