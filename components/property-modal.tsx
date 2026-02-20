"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zonas, tiposPropiedad } from "@/lib/data"
import type { Property, PropertyStatus, PropertyType } from "@/lib/types"
import { MapPin, Upload } from "lucide-react"

interface PropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null
  onSave: (property: Omit<Property, "id">) => void
}

export function PropertyModal({
  open,
  onOpenChange,
  property,
  onSave,
}: PropertyModalProps) {
  const [nombre, setNombre] = useState("")
  const [precio, setPrecio] = useState("")
  const [direccion, setDireccion] = useState("")
  const [zona, setZona] = useState("")
  const [tipo, setTipo] = useState<PropertyType | "">("")
  const [estado, setEstado] = useState<PropertyStatus>("disponible")
  const [areaTotales, setAreaTotales] = useState("")
  const [areaConstruccion, setAreaConstruccion] = useState("")
  const [habitaciones, setHabitaciones] = useState("")
  const [banos, setBanos] = useState("")
  const [antiguedad, setAntiguedad] = useState("")
  const [descripcionBreve, setDescripcionBreve] = useState("")
  const [descripcionLarga, setDescripcionLarga] = useState("")
  const [garaje, setGaraje] = useState(false)
  const [piscina, setPiscina] = useState(false)
  const [patio, setPatio] = useState(false)
  const [seguridadPrivada, setSeguridadPrivada] = useState(false)
  const [balcon, setBalcon] = useState(false)
  const [latitud, setLatitud] = useState("4.7110")
  const [longitud, setLongitud] = useState("-74.0721")

  useEffect(() => {
    if (property) {
      setNombre(property.nombre)
      setPrecio(property.precio.toString())
      setDireccion(property.direccion)
      setZona(property.zona)
      setTipo(property.tipo)
      setEstado(property.estado)
      setAreaTotales(property.areaTotales.toString())
      setAreaConstruccion(property.areaConstruccion.toString())
      setHabitaciones(property.habitaciones.toString())
      setBanos(property.banos.toString())
      setAntiguedad(property.antiguedad)
      setDescripcionBreve(property.descripcionBreve)
      setDescripcionLarga(property.descripcionLarga)
      setGaraje(property.caracteristicas.garaje)
      setPiscina(property.caracteristicas.piscina)
      setPatio(property.caracteristicas.patio)
      setSeguridadPrivada(property.caracteristicas.seguridadPrivada)
      setBalcon(property.caracteristicas.balcon)
      setLatitud(property.latitud)
      setLongitud(property.longitud)
    } else {
      setNombre("")
      setPrecio("")
      setDireccion("")
      setZona("")
      setTipo("")
      setEstado("disponible")
      setAreaTotales("")
      setAreaConstruccion("")
      setHabitaciones("")
      setBanos("")
      setAntiguedad("")
      setDescripcionBreve("")
      setDescripcionLarga("")
      setGaraje(false)
      setPiscina(false)
      setPatio(false)
      setSeguridadPrivada(false)
      setBalcon(false)
      setLatitud("4.7110")
      setLongitud("-74.0721")
    }
  }, [property, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      nombre,
      descripcionBreve,
      descripcionLarga,
      precio: parseFloat(precio) || 0,
      tipo: (tipo || "house") as PropertyType,
      zona,
      habitaciones: parseInt(habitaciones) || 0,
      banos: parseInt(banos) || 0,
      areaTotales: parseFloat(areaTotales) || 0,
      areaConstruccion: parseFloat(areaConstruccion) || 0,
      antiguedad,
      direccion,
      imagenes: property ? property.imagenes : ["/images/casa-moderna.jpg"],
      caracteristicas: {
        garaje,
        piscina,
        patio,
        seguridadPrivada,
        balcon,
      },
      estado,
      fecha: property
        ? property.fecha
        : new Date().toISOString().split("T")[0],
      latitud,
      longitud,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {property ? "Editar Propiedad" : "Agregar Nueva Propiedad"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Informacion General */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {"Informacion General"}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="titulo" className="font-semibold text-foreground">
                    {"Titulo"}
                  </Label>
                  <Input
                    id="titulo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="precio" className="font-semibold text-foreground">
                    Precio
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="direccion" className="font-semibold text-foreground">
                    {"Direccion"}
                  </Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Zona</Label>
                  <Select value={zona} onValueChange={setZona}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zonas.map((z) => (
                        <SelectItem key={z} value={z}>
                          {z}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">
                    Tipo de propiedad
                  </Label>
                  <Select
                    value={tipo}
                    onValueChange={(v) => setTipo(v as PropertyType)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPropiedad.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Estado</Label>
                  <Select
                    value={estado}
                    onValueChange={(v) => setEstado(v as PropertyStatus)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="reservada">Reservada</SelectItem>
                      <SelectItem value="vendida">Vendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles Tecnicos */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {"Detalles Tecnicos"}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaTotales" className="font-semibold text-foreground">
                    {"m\u00B2 totales"}
                  </Label>
                  <Input
                    id="areaTotales"
                    type="number"
                    value={areaTotales}
                    onChange={(e) => setAreaTotales(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaConstruccion" className="font-semibold text-foreground">
                    {"m\u00B2 construccion"}
                  </Label>
                  <Input
                    id="areaConstruccion"
                    type="number"
                    value={areaConstruccion}
                    onChange={(e) => setAreaConstruccion(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="habitaciones" className="font-semibold text-foreground">
                    Habitaciones
                  </Label>
                  <Input
                    id="habitaciones"
                    type="number"
                    value={habitaciones}
                    onChange={(e) => setHabitaciones(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="banos" className="font-semibold text-foreground">
                    {"Banos"}
                  </Label>
                  <Input
                    id="banos"
                    type="number"
                    value={banos}
                    onChange={(e) => setBanos(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="antiguedad" className="font-semibold text-foreground">
                    {"Antiguedad"}
                  </Label>
                  <Input
                    id="antiguedad"
                    value={antiguedad}
                    onChange={(e) => setAntiguedad(e.target.value)}
                    placeholder="ej: 5 anos, Nuevo"
                    className="bg-card"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descripciones */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Descripciones
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcionBreve" className="font-semibold text-foreground">
                  {"Descripcion breve"}
                </Label>
                <Textarea
                  id="descripcionBreve"
                  value={descripcionBreve}
                  onChange={(e) => setDescripcionBreve(e.target.value)}
                  rows={3}
                  className="bg-card resize-y"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcionLarga" className="font-semibold text-foreground">
                  {"Descripcion larga"}
                </Label>
                <Textarea
                  id="descripcionLarga"
                  value={descripcionLarga}
                  onChange={(e) => setDescripcionLarga(e.target.value)}
                  rows={4}
                  className="bg-card resize-y"
                />
              </div>
            </div>
          </div>

          {/* Caracteristicas */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {"Caracteristicas"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="garaje"
                  checked={garaje}
                  onCheckedChange={(v) => setGaraje(v === true)}
                />
                <Label htmlFor="garaje" className="text-sm font-normal text-foreground cursor-pointer">
                  Garaje
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="piscina"
                  checked={piscina}
                  onCheckedChange={(v) => setPiscina(v === true)}
                />
                <Label htmlFor="piscina" className="text-sm font-normal text-foreground cursor-pointer">
                  Piscina
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="patio"
                  checked={patio}
                  onCheckedChange={(v) => setPatio(v === true)}
                />
                <Label htmlFor="patio" className="text-sm font-normal text-foreground cursor-pointer">
                  Patio
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="seguridadPrivada"
                  checked={seguridadPrivada}
                  onCheckedChange={(v) => setSeguridadPrivada(v === true)}
                />
                <Label htmlFor="seguridadPrivada" className="text-sm font-normal text-foreground cursor-pointer">
                  Seguridad privada
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="balcon"
                  checked={balcon}
                  onCheckedChange={(v) => setBalcon(v === true)}
                />
                <Label htmlFor="balcon" className="text-sm font-normal text-foreground cursor-pointer">
                  {"Balcon"}
                </Label>
              </div>
            </div>
          </div>

          {/* Ubicacion */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {"Ubicacion"}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="latitud" className="font-semibold text-foreground">
                    Latitud
                  </Label>
                  <Input
                    id="latitud"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="longitud" className="font-semibold text-foreground">
                    Longitud
                  </Label>
                  <Input
                    id="longitud"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>

              {/* Map preview placeholder */}
              <div className="flex flex-col items-center justify-center rounded-md bg-muted py-10 gap-2">
                <MapPin className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Vista previa del mapa (simulado)
                </span>
              </div>
            </div>
          </div>

          {/* Imagenes */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {"Imagenes"}
            </h3>
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 py-10 gap-2">
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-accent-foreground font-medium">
                Subir imagenes (simulado)
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG hasta 10MB
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-card text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-foreground text-card hover:bg-foreground/90"
            >
              {property ? "Guardar cambios" : "Guardar propiedad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
