import { ProtectedRoute } from "@/lib/protected-route"
import { ProductsPage } from "@/components/products-page"

export default function Products() {
    return (
        <ProtectedRoute>
            <div className="p-6">
                <ProductsPage />
            </div>
        </ProtectedRoute>
    )
}
