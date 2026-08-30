import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Suspense, useEffect } from "react"

import { type ExoplanetPublic, ExoplanetsService } from "@/client"
import { ExoplanetProfile } from "@/components/Exoplanets/ExoplanetProfile"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Query: always resolve and load via readExoplanetById to trigger photo enrichment
const getExoplanetQueryOptions = (idParam: string) => ({
  queryFn: async (): Promise<ExoplanetPublic> => {
    const decoded = decodeURIComponent(idParam).trim()

    let planetId = decoded
    if (!UUID_REGEX.test(decoded)) {
      // If a planet name was passed, find its UUID via list endpoint
      const listResponse = await ExoplanetsService.readExoplanets({
        planetName: decoded,
        limit: 1,
      })
      const match = listResponse?.data?.[0] as ExoplanetPublic | undefined
      if (!match) {
        throw new Error(`Exoplanet "${decoded}" not found`)
      }
      planetId = match.id
    }

    // Call readExoplanetById (triggers backend on-demand NASA photo lookup & DB commit)
    const detailedPlanet = await ExoplanetsService.readExoplanetById({
      exoplanetId: planetId,
    })
    return detailedPlanet
  },
  queryKey: ["exoplanet", "detail", idParam],
})

export const Route = createFileRoute("/_layout/exoplanets/$id")({
  component: () => (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground">
            Loading exoplanet details...
          </span>
        </div>
      }
    >
      <ExoplanetDetailPage />
    </Suspense>
  ),
})

function ExoplanetDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(getExoplanetQueryOptions(id))
  const router = useRouter()

  useEffect(() => {
    if (data?.photo_url && !data.photo_url.startsWith("/assets/")) {
      // Enriched with real NASA photo - invalidate list queries so catalog updates
      queryClient.invalidateQueries({ queryKey: ["exoplanets"] })
    }
  }, [data?.photo_url, queryClient])

  return (
    <div className="relative flex min-h-full flex-col">
      <SpaceBackground />
      <ExoplanetProfile exoplanet={data} onBack={() => router.history.back()} />
    </div>
  )
}
