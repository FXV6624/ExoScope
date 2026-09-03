import { createFileRoute, redirect } from "@tanstack/react-router"
import { KeyRound, Shield, User } from "lucide-react"

import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { getInitials } from "@/utils"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/profile")({
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  component: ProfilePage,
  head: () => ({
    meta: [{ title: "Profile — ExoScope" }],
  }),
})

// ─── Section card ─────────────────────────────────────────────────────────────

function ProfileSection({
  title,
  icon: Icon,
  danger,
  children,
}: {
  title: string
  icon: React.ElementType
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`space-card flex flex-col gap-4 rounded-2xl p-6 shadow-sm ${
        danger ? "border-red-500/30 bg-red-50 dark:bg-red-950/10" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Icon
          size={16}
          className={
            danger ? "text-red-500" : "text-cyan-600 dark:text-cyan-400"
          }
        />
        <h2
          className={`text-sm font-bold uppercase tracking-widest ${
            danger ? "text-red-500" : "text-cyan-600 dark:text-cyan-400"
          }`}
        >
          {title}
        </h2>
      </div>
      <div className="flex-1 text-foreground">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user: currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <div className="relative flex min-h-full flex-col gap-6">
      <SpaceBackground />

      <div className="relative flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <User size={13} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Account Management
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Profile & Security
          </h1>
        </div>

        {/* Account Overview Badges */}
        <div className="space-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-12 border-2 border-sky-300 dark:border-sky-500/40 shadow-xs">
              <AvatarImage
                src="/assets/images/user-avatar.png"
                alt={currentUser.full_name || "User"}
              />
              <AvatarFallback className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold text-base">
                {getInitials(currentUser.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {currentUser.full_name || "User Profile"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 border border-border">
              <Shield size={14} className="text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs text-muted-foreground">Role:</span>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Administrator
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 border border-border">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            {currentUser.created_at && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 border border-border">
                <span className="text-xs text-muted-foreground">
                  Member Since:
                </span>
                <span className="text-xs font-medium text-foreground">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Side-by-side cards: Personal Information & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl items-start">
          <ProfileSection title="Personal Information" icon={User}>
            <UserInformation />
          </ProfileSection>

          <ProfileSection title="Security & Password" icon={KeyRound}>
            <ChangePassword />
          </ProfileSection>
        </div>
      </div>
    </div>
  )
}
