import { Droplets, Globe, HelpCircle, Layers, Sparkles } from "lucide-react"

import type { ExoplanetPublic } from "@/client"
import { ConfidenceCard } from "./ConfidenceCard"

interface PlanetVisualCardProps {
  exoplanet: ExoplanetPublic
  classColor: string
  compColor: string
  habColor: string
  isRealNasaPhoto: boolean
  onOpenClassificationModal: () => void
}

export function PlanetVisualCard({
  exoplanet,
  classColor,
  compColor,
  habColor,
  isRealNasaPhoto,
  onOpenClassificationModal,
}: PlanetVisualCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Planet image / NASA visualization */}
      <div className="planet-visual relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl">
        {exoplanet.photo_url ? (
          <img
            src={exoplanet.photo_url}
            alt={exoplanet.planet_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.2)",
              }}
            >
              <Globe size={36} className="text-space-accent opacity-80" />
            </div>
            <p className="text-xs text-space-muted">
              No direct NASA imagery on record
            </p>
          </div>
        )}
        {isRealNasaPhoto ? (
          <span
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-wide backdrop-blur-md shadow-md"
            style={{
              background: "rgba(6, 13, 31, 0.85)",
              border: "1px solid rgba(34, 211, 238, 0.5)",
              color: "#22d3ee",
            }}
          >
            <Sparkles size={12} className="text-cyan-400" />
            NASA Archive Photo
          </span>
        ) : (
          <span className="ai-badge absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9.5px] font-mono tracking-wide backdrop-blur-md shadow-md">
            AI-generated photo based on composition
          </span>
        )}
      </div>

      {/* Vertical Confidence Analysis Cards */}
      <ConfidenceCard
        title="Planet Class"
        value={exoplanet.planet_class}
        confidence={exoplanet.planet_class_confidence}
        color={classColor}
        icon={Layers}
        badge
      />
      <ConfidenceCard
        title="Composition"
        value={exoplanet.composition}
        confidence={exoplanet.composition_confidence}
        color={compColor}
        icon={Droplets}
        badge
      />
      <ConfidenceCard
        title="Habitability Score"
        value={exoplanet.habitability_score}
        confidence={exoplanet.habitability_confidence}
        color={habColor}
        icon={Sparkles}
        badge={false}
      />

      <button
        type="button"
        onClick={onOpenClassificationModal}
        className="classification-btn flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 py-2.5 px-3 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-950/60 hover:border-cyan-400 hover:text-cyan-100 cursor-pointer active:scale-98 shadow-sm"
      >
        <HelpCircle size={14} className="text-cyan-400" />
        <span>How classification works</span>
      </button>
    </div>
  )
}
