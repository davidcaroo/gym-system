import { ProtectedRoute } from "@/lib/protected-route"
import { MembersPage } from "@/components/members-page"

export default function Members() {
    return (
        <ProtectedRoute>
            <div className="p-6">
                <MembersPage />
            </div>
        </ProtectedRoute>
    )
}
