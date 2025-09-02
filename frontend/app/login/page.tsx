import { PublicRoute } from "@/lib/protected-route"
import { LoginPage } from "@/components/login-page"

export default function Login() {
    return (
        <PublicRoute>
            <LoginPage />
        </PublicRoute>
    )
}
