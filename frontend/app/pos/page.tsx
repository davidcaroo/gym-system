import { ProtectedRoute } from "@/lib/protected-route"
import { PointOfSalePage } from "@/components/point-of-sale-page"

export default function PointOfSale() {
    return (
        <ProtectedRoute>
            <div className="p-6">
                <PointOfSalePage />
            </div>
        </ProtectedRoute>
    )
}
