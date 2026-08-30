import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/admin")({
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  component: () => <Outlet />,
})
