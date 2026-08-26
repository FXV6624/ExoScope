import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { ChevronRight, Users } from "lucide-react"
import { Suspense } from "react"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import PendingUsers from "@/components/Pending/PendingUsers"
import useAuth from "@/hooks/useAuth"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/admin/users")({
  component: AdminUsersPage,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) throw redirect({ to: "/" })
  },
  head: () => ({ meta: [{ title: "Admin — Users" }] }),
})

// ─── Data ─────────────────────────────────────────────────────────────────────

function getUsersQueryOptions() {
  return {
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    queryKey: ["users"],
  }
}

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminUsersPage() {
  return (
    <div className="relative flex min-h-full flex-col gap-6">
      <SpaceBackground />

      <div className="relative flex flex-col gap-6">
        {/* Breadcrumb + Header */}
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-space-muted">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-space-accent">Users</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-space-accent" />
                <h1 className="text-2xl font-bold tracking-tight text-space-primary">
                  Users
                </h1>
              </div>
              <p className="mt-1 text-sm text-space-muted">
                Manage user accounts and permissions
              </p>
            </div>
            <AddUser />
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-x-auto"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(15, 25, 50, 0.5)",
          }}
        >
          <Suspense fallback={<PendingUsers />}>
            <UsersTableContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
