import { ProtectedRoute } from "@/lib/protected-route"
import { MainLayout } from "@/components/main-layout"

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <MainLayout />
        </ProtectedRoute>
    )
}
