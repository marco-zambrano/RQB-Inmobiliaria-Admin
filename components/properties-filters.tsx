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
import { provinciasEcuador } from "@/lib/data"

interface PropertiesFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedProvincia: string
  onProvinciaChange: (value: string) => void
  selectedEstado: string
  onEstadoChange: (value: string) => void
  selectedTipo: string
  onTipoChange: (value: string) => void
  onClearFilters: () => void
}

export function PropertiesFilters({
  searchQuery,
  onSearchChange,
  selectedProvincia,
  onProvinciaChange,
  selectedEstado,
  onEstadoChange,
  selectedTipo,
  onTipoChange,
  onClearFilters,
}: PropertiesFiltersProps) {
  const hasFilters = searchQuery || selectedProvincia !== "all" || selectedEstado !== "all" || selectedTipo !== "all"

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por titulo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card w-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedProvincia} onValueChange={onProvinciaChange}>
          <SelectTrigger className="w-full sm:w-[140px] bg-card cursor-pointer">
            <SelectValue placeholder="Provincia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.keys(provinciasEcuador).map((provincia) => (
              <SelectItem key={provincia} value={provincia}>
                {provincia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEstado} onValueChange={onEstadoChange}>
          <SelectTrigger className="w-full sm:w-[140px] bg-card cursor-pointer">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="vendida">Vendida</SelectItem>
            <SelectItem value="negociación">Negociación</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTipo} onValueChange={onTipoChange}>
          <SelectTrigger className="w-full sm:w-[140px] bg-card cursor-pointer">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="apartamento">Apto</SelectItem>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="terreno">Terreno</SelectItem>
            <SelectItem value="casa rentera">C. Rentera</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="w-full sm:w-auto text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
            <span className="hidden sm:inline ml-1">Limpiar</span>
          </Button>
        )}
      </div>
    </div>
  )
}
