import { Appearance } from "@/components/Common/Appearance"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Dynamic Animated Cosmic Space Background */}
      <SpaceBackground />

      {/* Top Header - Theme switcher only */}
      <header className="relative z-10 flex items-center justify-end p-6 md:p-8">
        <Appearance />
      </header>

      {/* Main Centered Modal Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className="w-full max-w-md rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 shadow-2xl shadow-cyan-950/40"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)",
          }}
        >
          {children}
        </div>
      </main>

      {/* Bottom Spacer for balanced vertical centering */}
      <div className="relative z-10 p-6 md:p-8" />
    </div>
  )
}
