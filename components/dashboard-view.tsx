"use client"

import { Building2, DollarSign, BedDouble } from "lucide-react"
import type { Property } from "@/lib/types"

interface DashboardViewProps {
  properties: Property[]
}

export function DashboardView({ properties }: DashboardViewProps) {
  const totalProperties = properties.length
  const avgPrice =
    properties.length > 0
      ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length
      : 0
  const totalRooms = properties.reduce((sum, p) => sum + (p.bedrooms ?? 0), 0)

  const stats = [
    {
      label: "Total Propiedades",
      value: totalProperties.toString(),
      icon: Building2,
    },
    {
      label: "Precio Promedio",
      value: `$${Math.round(avgPrice).toLocaleString("es-CO")}`,
      icon: DollarSign,
    },
    {
      label: "Total Habitaciones",
      value: totalRooms.toString(),
      icon: BedDouble,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <stat.icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
