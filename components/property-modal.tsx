"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { provinciasEcuador, tiposPropiedad } from "@/lib/data"
import type { Property, PropertyStatus, PropertyType } from "@/lib/types"
import { Upload, X } from "lucide-react"
import { MapPreview } from "./map-preview"
import { uploadImageToSupabase } from "@/lib/supabaseClient"

const propertySchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  precio: z.number().min(0, "El precio debe ser mayor a 0"),
  direccion: z.string().optional(),
  provincia: z.string().min(1, "Selecciona una provincia"),
  ciudad: z.string().min(1, "Selecciona una ciudad"),
  tipo: z.enum(["apartment", "house", "penthouse", "loft"]),
  estado: z.enum(["disponible", "reservada", "vendida"]),
  areaTotales: z.number().nonnegative().optional(),
  areaConstruccion: z.number().nonnegative().optional(),
  habitaciones: z.number().nonnegative().optional(),
  banos: z.number().nonnegative().optional(),
  antiguedadEsNuevo: z.boolean(),
  antiguedadAnos: z.number().nonnegative().optional(),
  descripcion: z.string().optional(),
  garaje: z.boolean(),
  piscina: z.boolean(),
  patio: z.boolean(),
  seguridadPrivada: z.boolean(),
  balcon: z.boolean(),
  dospisos: z.boolean(),
  trespisos: z.boolean(),
  mapsUrl: z.string().optional(),
  imagenes: z.array(z.string()),
})

type PropertyFormData = z.infer<typeof propertySchema>

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
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      nombre: "",
      precio: undefined,
      direccion: "",
      provincia: "",
      ciudad: "",
      tipo: "house",
      estado: "disponible",
      areaTotales: undefined,
      areaConstruccion: undefined,
      habitaciones: undefined,
      banos: undefined,
      antiguedadEsNuevo: false,
      antiguedadAnos: undefined,
      descripcion: "",
      garaje: false,
      piscina: false,
      patio: false,
      seguridadPrivada: false,
      balcon: false,
      dospisos: false,
      trespisos: false,
      mapsUrl: "",
      imagenes: [],
    },
  })

  const provincia = watch("provincia")
  const antiguedadEsNuevo = watch("antiguedadEsNuevo")
  const imagenes = watch("imagenes")
  const mapsUrl = watch("mapsUrl")

  const ciudadesDisponibles = provincia
    ? (provinciasEcuador[provincia as keyof typeof provinciasEcuador] || [])
    : []

  useEffect(() => {
    if (property) {
      reset({
        nombre: property.nombre,
        precio: property.precio,
        direccion: property.direccion,
        provincia: property.provincia,
        ciudad: property.ciudad,
        tipo: property.tipo,
        estado: property.estado,
        areaTotales: property.areaTotales,
        areaConstruccion: property.areaConstruccion,
        habitaciones: property.habitaciones,
        banos: property.banos,
        antiguedadEsNuevo: property.antiguedad.esNuevo,
        antiguedadAnos: property.antiguedad.anos,
        descripcion: property.descripcion,
        garaje: property.caracteristicas.garaje,
        piscina: property.caracteristicas.piscina,
        patio: property.caracteristicas.patio,
        seguridadPrivada: property.caracteristicas.seguridadPrivada,
        balcon: property.caracteristicas.balcon,
        dospisos: property.caracteristicas.dospisos,
        trespisos: property.caracteristicas.trespisos,
        mapsUrl: property.mapsUrl,
        imagenes: property.imagenes,
      })
    } else {
      reset({
        nombre: "",
        precio: undefined,
        direccion: "",
        provincia: "",
        ciudad: "",
        tipo: "house",
        estado: "disponible",
        areaTotales: undefined,
        areaConstruccion: undefined,
        habitaciones: undefined,
        banos: undefined,
        antiguedadEsNuevo: false,
        antiguedadAnos: undefined,
        descripcion: "",
        garaje: false,
        piscina: false,
        patio: false,
        seguridadPrivada: false,
        balcon: false,
        dospisos: false,
        trespisos: false,
        mapsUrl: "",
        imagenes: [],
      })
    }
  }, [property, open, reset])

  const onSubmit = (formData: PropertyFormData) => {
    onSave({
      nombre: formData.nombre,
      descripcion: formData.descripcion || "",
      precio: formData.precio || 0,
      tipo: formData.tipo as PropertyType,
      provincia: formData.provincia,
      ciudad: formData.ciudad,
      habitaciones: formData.habitaciones || 0,
      banos: formData.banos || 0,
      areaTotales: formData.areaTotales || 0,
      areaConstruccion: formData.areaConstruccion || 0,
      antiguedad: {
        esNuevo: formData.antiguedadEsNuevo,
        anos: formData.antiguedadAnos || 0,
      },
      direccion: formData.direccion || "",
      imagenes: formData.imagenes,
      caracteristicas: {
        garaje: formData.garaje,
        piscina: formData.piscina,
        patio: formData.patio,
        seguridadPrivada: formData.seguridadPrivada,
        balcon: formData.balcon,
        dospisos: formData.dospisos,
        trespisos: formData.trespisos,
      },
      estado: formData.estado as PropertyStatus,
      fecha: property?.fecha || new Date().toISOString().split("T")[0],
      mapsUrl: formData.mapsUrl || "",
    })
    onOpenChange(false)
  }

  const handleImageUpload = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    const updatedImagenes = [...imagenes]
    
    for (const file of fileArray) {
      try {
        const url = await uploadImageToSupabase(file)
        updatedImagenes.push(url)
      } catch (error) {
        console.error("Error subiendo imagen:", error)
      }
    }
    
    setValue("imagenes", updatedImagenes)
  }

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {property ? "Editar Propiedad" : "Agregar Nueva Propiedad"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Información General */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Información General
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nombre" className="font-semibold text-foreground">
                    Título
                  </Label>
                  <Input
                    id="nombre"
                    {...register("nombre")}
                    className="bg-card"
                  />
                  {errors.nombre && (
                    <span className="text-xs text-red-500">{errors.nombre.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="precio" className="font-semibold text-foreground">
                    Precio
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    {...register("precio", { valueAsNumber: true })}
                    className="bg-card"
                  />
                  {errors.precio && (
                    <span className="text-xs text-red-500">{errors.precio.message}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direccion" className="font-semibold text-foreground">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  {...register("direccion")}
                  className="bg-card"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Provincia</Label>
                  <Controller
                    name="provincia"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Seleccionar provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(provinciasEcuador).map((prov) => (
                            <SelectItem key={prov} value={prov}>
                              {prov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.provincia && (
                    <span className="text-xs text-red-500">{errors.provincia.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Ciudad</Label>
                  <Controller
                    name="ciudad"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={!provincia}>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Seleccionar ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciudadesDisponibles.map((ciudad) => (
                            <SelectItem key={ciudad} value={ciudad}>
                              {ciudad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ciudad && (
                    <span className="text-xs text-red-500">{errors.ciudad.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">
                    Tipo de propiedad
                  </Label>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Estado</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="reservada">Reservada</SelectItem>
                          <SelectItem value="vendida">Vendida</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detalles Técnicos */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Detalles Técnicos
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaTotales" className="font-semibold text-foreground">
                    m² totales
                  </Label>
                  <Input
                    id="areaTotales"
                    type="number"
                    {...register("areaTotales", { valueAsNumber: true })}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaConstruccion" className="font-semibold text-foreground">
                    m² construcción
                  </Label>
                  <Input
                    id="areaConstruccion"
                    type="number"
                    {...register("areaConstruccion", { valueAsNumber: true })}
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
                    {...register("habitaciones", { valueAsNumber: true })}
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="banos" className="font-semibold text-foreground">
                    Baños
                  </Label>
                  <Input
                    id="banos"
                    type="number"
                    {...register("banos", { valueAsNumber: true })}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Antigüedad</Label>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="antiguedadEsNuevo"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="antiguedadEsNuevo"
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      )}
                    />
                    <Label htmlFor="antiguedadEsNuevo" className="text-sm font-normal text-foreground cursor-pointer">
                      Nuevo
                    </Label>
                  </div>
                  {!antiguedadEsNuevo && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        {...register("antiguedadAnos", { valueAsNumber: true })}
                        placeholder="Años"
                        className="bg-card"
                      />
                      <span className="text-sm text-muted-foreground">años</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Descripción</h3>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion" className="font-semibold text-foreground">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                {...register("descripcion")}
                rows={5}
                className="bg-card resize-y"
              />
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Características
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "garaje", label: "Garaje" },
                { id: "piscina", label: "Piscina" },
                { id: "patio", label: "Patio" },
                { id: "seguridadPrivada", label: "Seguridad privada" },
                { id: "balcon", label: "Balcón" },
                { id: "dospisos", label: "Dos pisos" },
                { id: "trespisos", label: "Tres pisos" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Controller
                    name={id as any}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={id}
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    )}
                  />
                  <Label htmlFor={id} className="text-sm font-normal text-foreground cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Ubicación</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Copia el código embed de Google Maps o la URL completa del lugar
            </p>

            {/* Mapa Preview */}
            <MapPreview mapsUrl={mapsUrl} onUrlChange={(url) => setValue("mapsUrl", url)} />
          </div>

          {/* Imágenes */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Imágenes</h3>
            
            {/* Vista previa de imágenes subidas */}
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imagenes.map((imagen, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={imagen}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nuevasImagenes = imagenes.filter((_, i) => i !== idx)
                        setValue("imagenes", nuevasImagenes)
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Área de drag-drop */}
            <div
              onDrop={handleDragDrop}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 py-10 gap-2 cursor-pointer hover:bg-muted/70 transition-colors"
            >
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-accent-foreground font-medium">
                Arrastra imágenes aquí o click para seleccionar
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG hasta 10MB
              </span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer" />
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
