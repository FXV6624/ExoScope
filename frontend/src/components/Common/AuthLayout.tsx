import { Appearance } from "@/components/Common/Appearance"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground">
      {/* Dynamic Animated Cosmic Space Background */}
      <SpaceBackground />

      {/* Top Header - Theme switcher only */}
      <header className="relative z-10 flex items-center justify-end p-6 md:p-8">
        <Appearance buttonClassName="bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-md shadow-blue-600/25 [&_svg]:text-white" />
      </header>

      {/* Main Centered Modal Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="space-card w-full max-w-md rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 shadow-2xl">
          {children}
        </div>
      </main>

      {/* Bottom Spacer for balanced vertical centering */}
      <div className="relative z-10 p-6 md:p-8" />
    </div>
  )
}
