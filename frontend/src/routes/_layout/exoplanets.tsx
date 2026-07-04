import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { ExoplanetsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Exoplanets/columns"
import PendingExoplanets from "@/components/Pending/PendingExoplanets"

function getExoplanetsQueryOptions() {
  return {
    queryFn: () => ExoplanetsService.readExoplanets(),
    queryKey: ["exoplanets"],
  }
}

export const Route = createFileRoute("/_layout/exoplanets")({
  component: Exoplanets,
  head: () => ({
    meta: [
      {
        title: "Exoplanets",
      },
    ],
  }),
})

function ExoplanetsTableContent() {
  const { data: exoplanets } = useSuspenseQuery(getExoplanetsQueryOptions())

  if (exoplanets.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">There are no exoplanets yet</h3>
      </div>
    )
  }

  return <DataTable
  columns={columns}
  data={exoplanets.data}
  searchColumn="planet_name"
  searchPlaceholder="Search exoplanets..."
/>
}

function ExoplanetsTable() {
  return (
    <Suspense fallback={<PendingExoplanets />}>
      <ExoplanetsTableContent />
    </Suspense>
  )
}

function Exoplanets() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exoplanets</h1>
          <p className="text-muted-foreground">Discover and explore exoplanets from around the galaxy</p>
        </div>
      </div>
      <ExoplanetsTable />
    </div>
  )
}
