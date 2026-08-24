import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { type ExoplanetPublic, ExoplanetsService } from "@/client"
import { ExoplanetsTable } from "@/components/Exoplanets/ExoplanetsTable"
import { SpaceBackground } from "@/components/Exoplanets/SpaceBackground"
import PendingExoplanets from "@/components/Pending/PendingExoplanets"

const exoplanetsQueryOptions = {
  queryFn: () => ExoplanetsService.readExoplanets(),
  queryKey: ["exoplanets"],
}

export const Route = createFileRoute("/_layout/exoplanets/")({
  component: () => (
    <Suspense fallback={<PendingExoplanets />}>
      <ExoplanetsPage />
    </Suspense>
  ),
  head: () => ({ meta: [{ title: "Exoplanets" }] }),
})

function ExoplanetsPage() {
  const { data } = useSuspenseQuery(exoplanetsQueryOptions)
  const navigate = useNavigate()

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col md:-m-8 md:h-[calc(100%+4rem)]">
      <SpaceBackground />
      <div className="flex min-h-0 flex-1 flex-col px-6 py-6 md:px-8">
        <ExoplanetsTable
          data={data.data as ExoplanetPublic[]}
          onSelect={(id) => navigate({ to: "/exoplanets/$id", params: { id } })}
        />
      </div>
    </div>
  )
}
