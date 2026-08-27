import { createFileRoute } from "@tanstack/react-router"
import { AlertTriangle, KeyRound, Shield, User } from "lucide-react"

import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_layout/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: "Profile — Data Engineering Platform" }],
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
      className="flex flex-col gap-4 rounded-2xl p-6"
      style={{
        background: danger
          ? "rgba(220, 38, 38, 0.05)"
          : "rgba(15, 25, 50, 0.6)",
        border: danger
          ? "1px solid rgba(239, 68, 68, 0.2)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <Icon
          size={16}
          className={danger ? "text-red-400" : "text-space-accent"}
        />
        <h2
          className={`text-sm font-medium uppercase tracking-widest ${
            danger ? "text-red-400" : "text-space-accent"
          }`}
        >
          {title}
        </h2>
      </div>
      <div className="flex-1">{children}</div>
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
            <User size={13} className="text-space-accent" />
            <span className="text-xs uppercase tracking-widest text-space-accent">
              Account Management
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-space-primary">
            Profile & Security
          </h1>
          <p className="mt-1 text-sm text-space-muted">
            Manage your personal profile details, account credentials, and
            security preferences.
          </p>
        </div>

        {/* Account Overview Badges */}
        <div
          className="flex flex-wrap items-center gap-4 rounded-2xl p-4"
          style={{
            background: "rgba(15, 25, 50, 0.4)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-space-accent" />
            <span className="text-xs text-space-muted">Role:</span>
            <span className="text-xs font-semibold text-space-primary uppercase tracking-wider">
              {currentUser.is_superuser
                ? "Super Administrator"
                : "Standard User"}
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-space-muted">Status:</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
          {currentUser.created_at && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-space-muted">Member Since:</span>
                <span className="text-xs text-space-subtle">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
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

        {/* Danger Zone (only for non-superusers as per backend rules) */}
        {!currentUser.is_superuser && (
          <div className="w-full max-w-6xl">
            <ProfileSection title="Danger Zone" icon={AlertTriangle} danger>
              <DeleteAccount />
            </ProfileSection>
          </div>
        )}
      </div>
    </div>
  )
}
