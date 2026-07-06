import type { ColumnDef } from "@tanstack/react-table"

import type { ExoplanetPublic } from "@/client"

const formatNumber = (value: number | null | undefined) =>
  value != null ? value.toFixed(2) : "—"

export const columns: ColumnDef<ExoplanetPublic>[] = [
  {
    accessorKey: "planet_name",
    header: "Planet",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.planet_name}</span>
    ),
  },
  {
    accessorKey: "host_star",
    header: "Host Star",
    cell: ({ row }) => row.original.host_star || "—",
  },
  {
    accessorKey: "discovery_method",
    header: "Discovery Method",
    cell: ({ row }) => row.original.discovery_method || "—",
  },
  {
    accessorKey: "discovery_year",
    header: "Year",
    cell: ({ row }) => row.original.discovery_year ?? "—",
  },
  {
    accessorKey: "planet_mass",
    header: "Mass (M⊕)",
    cell: ({ row }) => formatNumber(row.original.planet_mass),
  },
  {
    accessorKey: "planet_radius",
    header: "Radius (R⊕)",
    cell: ({ row }) => formatNumber(row.original.planet_radius),
  },
]
