"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zonas } from "@/lib/data"

interface PropertiesFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedZona: string
  onZonaChange: (value: string) => void
  selectedEstado: string
  onEstadoChange: (value: string) => void
  onClearFilters: () => void
}

export function PropertiesFilters({
  searchQuery,
  onSearchChange,
  selectedZona,
  onZonaChange,
  selectedEstado,
  onEstadoChange,
  onClearFilters,
}: PropertiesFiltersProps) {
  const hasFilters = searchQuery || selectedZona !== "all" || selectedEstado !== "all"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por titulo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={selectedZona} onValueChange={onZonaChange}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las zonas</SelectItem>
            {zonas.map((zona) => (
              <SelectItem key={zona} value={zona}>
                {zona}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEstado} onValueChange={onEstadoChange}>
          <SelectTrigger className="w-[170px] bg-card">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="reservada">Reservada</SelectItem>
            <SelectItem value="vendida">Vendida</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
