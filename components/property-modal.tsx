"use client"

import { useEffect, useRef, useState } from "react"
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
import { Upload, X, Trash2 } from "lucide-react"
import { MapPreview } from "./map-preview"
import { uploadImageToSupabase, deleteImageFromSupabase } from "@/lib/supabaseClient"

const propertySchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  precio: z.number().min(0, "El precio debe ser mayor a 0"),
  direccion: z.string().optional(),
  provincia: z.string().min(1, "Selecciona una provincia"),
  ciudad: z.string().min(1, "Selecciona una ciudad"),
  tipo: z.enum(["negocio", "apartamento", "casa"]),
  estado: z.enum(["disponible", "vendida"]),
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
      tipo: "negocio",
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<{ id: string; url: string; file: File }[]>([])

  const ciudadesDisponibles = provincia
    ? (provinciasEcuador[provincia as keyof typeof provinciasEcuador] || [])
    : []

  useEffect(() => {
    setPendingFiles((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url))
      return []
    })
    if (property) {
      const featuresSet = new Set(property.features ?? [])
      reset({
        nombre: property.title,
        precio: property.price,
        direccion: property.address,
        provincia: property.province,
        ciudad: property.city,
        tipo: property.property_type,
        estado: property.status,
        areaTotales: property.sqm_total ?? undefined,
        areaConstruccion: property.sqm_built ?? undefined,
        habitaciones: property.bedrooms ?? undefined,
        banos: property.bathrooms ?? undefined,
        antiguedadEsNuevo: property.antiquity_years === 0,
        antiguedadAnos: property.antiquity_years || undefined,
        descripcion: property.description ?? "",
        garaje: featuresSet.has("garaje"),
        piscina: featuresSet.has("piscina"),
        patio: featuresSet.has("patio"),
        seguridadPrivada: featuresSet.has("seguridadPrivada"),
        balcon: featuresSet.has("balcon"),
        dospisos: featuresSet.has("dospisos"),
        trespisos: featuresSet.has("trespisos"),
        mapsUrl: property.latitude != null && property.longitude != null
          ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
          : "",
        imagenes: (property.images ?? []).map((i) => i.image_url),
      })
    } else {
      reset({
        nombre: "",
        precio: undefined,
        direccion: "",
        provincia: "",
        ciudad: "",
        tipo: "negocio",
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

  const onSubmit = async (formData: PropertyFormData) => {
    const features: string[] = []
    if (formData.garaje) features.push("garaje")
    if (formData.piscina) features.push("piscina")
    if (formData.patio) features.push("patio")
    if (formData.seguridadPrivada) features.push("seguridadPrivada")
    if (formData.balcon) features.push("balcon")
    if (formData.dospisos) features.push("dospisos")
    if (formData.trespisos) features.push("trespisos")

    const antiquity_years = formData.antiguedadEsNuevo ? 0 : (formData.antiguedadAnos ?? 0)

    // Subir solo las imágenes pendientes (nuevas) a Supabase al guardar
    const urlsExistentes = formData.imagenes
    const urlsNuevas: string[] = []
    for (const p of pendingFiles) {
      try {
        const url = await uploadImageToSupabase(p.file)
        urlsNuevas.push(url)
        URL.revokeObjectURL(p.url)
      } catch (error) {
        console.error("Error subiendo imagen:", error)
        alert("Error al subir las imágenes. Por favor intenta de nuevo.")
        return
      }
    }
    const urlsSupabase = [...urlsExistentes, ...urlsNuevas]

    onSave({
      title: formData.nombre,
      description: formData.descripcion || null,
      price: formData.precio || 0,
      property_type: formData.tipo as PropertyType,
      province: formData.provincia,
      city: formData.ciudad,
      bedrooms: formData.habitaciones ?? null,
      bathrooms: formData.banos ?? null,
      sqm_total: formData.areaTotales ?? null,
      sqm_built: formData.areaConstruccion ?? null,
      antiquity_years,
      address: formData.direccion || "",
      features,
      status: formData.estado as PropertyStatus,
      latitude: null,
      longitude: null,
      interest_level: property?.interest_level ?? 0,
      sold_at: property?.sold_at ?? null,
      created_at: property?.created_at ?? new Date().toISOString(),
      images: urlsSupabase.map((url) => ({
        id: "",
        property_id: property?.id ?? "",
        image_url: url,
        created_at: "",
      })),
    })
    setPendingFiles([])
    onOpenChange(false)
  }

  const handleImageUpload = (files: FileList) => {
    const fileArray = Array.from(files).filter(
      (f) => f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/jpg"
    )
    if (fileArray.length === 0) return

    const nuevos = fileArray.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
    }))
    setPendingFiles((prev) => [...prev, ...nuevos])
  }

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files?.length) handleImageUpload(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
            
            {(imagenes.length > 0 || pendingFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imagenes.map((imagen, idx) => (
                  <div key={`exist-${idx}-${imagen.slice(-20)}`} className="relative group">
                    <img
                      src={imagen}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-md bg-muted"
                    />
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!confirm("¿Deseas eliminar esta imagen?")) return
                        try {
                          await deleteImageFromSupabase(imagen)
                          setValue(
                            "imagenes",
                            imagenes.filter((_, i) => i !== idx)
                          )
                        } catch (error) {
                          console.error("Error deleting image:", error)
                          alert("Error al eliminar la imagen. Por favor intenta de nuevo.")
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {pendingFiles.map((p) => (
                  <div key={p.id} className="relative group">
                    <img
                      src={p.url}
                      alt={`Nueva imagen`}
                      className="w-full h-24 object-cover rounded-md bg-muted"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!confirm("¿Deseas eliminar esta imagen?")) return
                        URL.revokeObjectURL(p.url)
                        setPendingFiles((prev) => prev.filter((x) => x.id !== p.id))
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Área de drag-drop: label hace click → abre explorador; div recibe drop */}
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full cursor-pointer rounded-md border-2 border-dashed border-border bg-muted/50 py-10 gap-2 hover:bg-muted/70 transition-colors"
              onDrop={handleDragDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const files = e.target.files
                  if (files?.length) {
                    handleImageUpload(files)
                    e.target.value = ""
                  }
                }}
                className="sr-only"
                tabIndex={-1}
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm text-accent-foreground font-medium">
                  Arrastra imágenes aquí o haz click para seleccionar
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG hasta 10MB
                </span>
              </div>
            </label>
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
