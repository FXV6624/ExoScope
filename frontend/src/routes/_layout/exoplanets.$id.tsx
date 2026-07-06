import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Suspense } from "react"

import { ExoplanetsService } from "@/client"
import { ExoplanetProfile } from "@/components/Exoplanets/ExoplanetProfile"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"

const getExoplanetQueryOptions = (id: string) => ({
  queryFn: () => ExoplanetsService.readExoplanetById({ exoplanetId: id }),
  queryKey: ["exoplanet", id],
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
  const { data } = useSuspenseQuery(getExoplanetQueryOptions(id))
  const router = useRouter()

  return (
    <div className="-m-6 h-[calc(100%+3rem)] overflow-y-auto md:-m-8 md:h-[calc(100%+4rem)]">
      <SpaceBackground />
      <ExoplanetProfile exoplanet={data} onBack={() => router.history.back()} />
    </div>
  )
}
