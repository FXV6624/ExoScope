import { Loader2, Sliders, Trash2 } from "lucide-react"

interface EtlHeaderProps {
  onPurgeCache: () => void
  isPurging: boolean
}

export function EtlHeader({ onPurgeCache, isPurging }: EtlHeaderProps) {
  return (
    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Sliders size={13} className="text-cyan-400" />
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
            System Control
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Admin Control Center
        </h1>
      </div>

      {/* Global Purge Cache Quick Action */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onPurgeCache}
          disabled={isPurging}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 backdrop-blur-md transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Purge Redis and in-memory cache"
        >
          {isPurging ? (
            <Loader2 size={14} className="animate-spin text-red-400" />
          ) : (
            <Trash2 size={14} className="text-red-400" />
          )}
          <span>Purge Cache</span>
        </button>
      </div>
    </div>
  )
}
