import { ProtectedRoute } from "@/lib/protected-route"
import { TestContextPage } from "@/components/test-context-page"

export default function TestContext() {
    return (
        <ProtectedRoute>
            <div className="p-6">
                <TestContextPage />
            </div>
        </ProtectedRoute>
    )
}
