"use client"

import Image from "next/image"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/types"

interface PropertiesTableProps {
  properties: Property[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
}

function StatusBadge({ estado }: { estado: string }) {
  const config: Record<string, { label: string; className: string }> = {
    disponible: {
      label: "Disponible",
      className: "border-transparent bg-green-600 text-white hover:bg-green-600",
    },
    reservada: {
      label: "Reservada",
      className: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500",
    },
    vendida: {
      label: "Vendida",
      className: "border-transparent bg-muted-foreground text-white hover:bg-muted-foreground",
    },
  }

  const { label, className } = config[estado] ?? {
    label: estado,
    className: "",
  }

  return (
    <Badge className={className}>
      {label}
    </Badge>
  )
}

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-CO")}`
}

export function PropertiesTable({ properties, onEdit, onDelete }: PropertiesTableProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
        <p className="text-muted-foreground">No se encontraron propiedades</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px] text-muted-foreground font-normal text-sm">Imagen</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Titulo</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Precio</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Zona</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Estado</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Fecha</TableHead>
            <TableHead className="text-right text-muted-foreground font-normal text-sm">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="relative h-12 w-16 overflow-hidden rounded-md">
                  <Image
                    src={property.imagenes[0] || "/images/casa-moderna.jpg"}
                    alt={property.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {property.nombre}
              </TableCell>
              <TableCell className="text-foreground">
                {formatPrice(property.precio)}
              </TableCell>
              <TableCell className="text-foreground">
                {property.provincia}
              </TableCell>
              <TableCell>
                <StatusBadge estado={property.estado} />
              </TableCell>
              <TableCell className="text-foreground">
                {property.fecha}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(property)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(property)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function PropertiesCards({ properties, onEdit, onDelete }: PropertiesTableProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
        <p className="text-muted-foreground">No se encontraron propiedades</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex gap-4">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
              <Image
                src={property.imagenes[0] || "/images/casa-moderna.jpg"}
                alt={property.nombre}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <h3 className="text-sm font-medium text-foreground">{property.nombre}</h3>
              <p className="text-sm text-foreground">{formatPrice(property.precio)}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{property.provincia}</span>
                <StatusBadge estado={property.estado} />
              </div>
              <p className="text-xs text-muted-foreground">{property.fecha}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(property)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(property)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
