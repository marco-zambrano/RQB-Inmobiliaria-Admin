"use client"

import { useEffect, useRef, useState } from "react"
import { Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { provinciasEcuador, tiposPropiedad } from "@/lib/data"
import type { Property, PropertyStatus, PropertyType } from "@/lib/types"
import { Upload, X } from "lucide-react"
import { MapPreview } from "./map-preview"
import { deleteImageFromSupabase } from "@/lib/supabaseClient"
import { usePropertyForm } from "@/hooks/modal/use-property-form"
import { usePropertyMedia } from "@/hooks/modal/use-property-media"

interface PropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null
  onSave: (property: Omit<Property, "id">, videos?: string[]) => void
}

export function PropertyModal({ open, onOpenChange, property, onSave }: PropertyModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const form = usePropertyForm(property, open)
  const media = usePropertyMedia(property)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form
  const provincia = watch("provincia")
  const antiguedadEsNuevo = watch("antiguedadEsNuevo")
  const imagenes = watch("imagenes")
  const mapsUrl = watch("mapsUrl")

  const ciudadesDisponibles = provincia
    ? (provinciasEcuador[provincia as keyof typeof provinciasEcuador] || [])
    : []

  useEffect(() => {
    if (open) media.initMedia()
  }, [property, open])

  const onSubmit = async (formData: any) => {
    if (isSaving) return
    setIsSaving(true)
    onOpenChange(false)

    try {
      const features: string[] = []
      if (formData.garaje) features.push("garaje")
      if (formData.piscina) features.push("piscina")
      if (formData.patio) features.push("patio")
      if (formData.seguridadPrivada) features.push("seguridadPrivada")
      if (formData.balcon) features.push("balcon")
      if (formData.numeroPisos > 0)
        features.push(formData.numeroPisos === 1 ? "1 piso" : `${formData.numeroPisos} pisos`)

      const antiquity_years = formData.antiguedadEsNuevo ? 0 : (formData.antiguedadAnos ?? 0)

      const [{ urlsNuevas, videosNuevos }, mapResult] = await Promise.all([
        media.uploadAll(),
        (async () => {
          if (!formData.mapsUrl?.trim()) return ""
          if (formData.mapsUrl.includes("google.com") && formData.mapsUrl.includes("/maps/embed"))
            return formData.mapsUrl.trim()
          const res = await fetch("/api/maps-embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: formData.mapsUrl.trim() }),
          })
          const data = await res.json().catch(() => ({ embedUrl: null }))
          return data.embedUrl ?? ""
        })(),
      ])

      await media.deleteMarkedVideos()

      const urlsExistentes = formData.imagenes.filter((url: string) => !url.startsWith("blob:"))
      const urlsSupabase = [...urlsExistentes, ...urlsNuevas]
      const videosSupabase = [...media.existingVideos, ...videosNuevos]

      const propertyData: Omit<Property, "id"> = {
        title: formData.title,
        description: formData.descripcion ?? "",
        price: formData.precio || 0,
        property_type: formData.tipo as PropertyType,
        province: formData.provincia,
        city: formData.ciudad,
        bedrooms: formData.habitaciones ?? null,
        bathrooms: formData.banos ?? null,
        sqm_total: formData.areaTotales ?? null,
        sqm_built: formData.areaConstruccion ?? null,
        antiquity_years,
        venta_type: formData.ventaType ?? null,
        property_owner: formData.propertyOwner ?? null,
        address: formData.direccion || "",
        features,
        status: formData.estado as PropertyStatus,
        map_url: mapResult,
        interest_level: property?.interest_level ?? 0,
        sold_at: property?.sold_at ?? null,
        created_at: property?.created_at ?? new Date().toISOString(),
        images: urlsSupabase.map((url) => ({
          id: "", property_id: property?.id ?? "", image_url: url, created_at: "",
        })),
      }

      onSave(propertyData, videosSupabase)

    } catch (err) {
      console.error("Save error:", err)
      alert("Error al guardar la propiedad. Revisa la consola.")
    } finally {
      media.reset()
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-2xl bg-card max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground pr-8">
            {property ? `Editar Propiedad --> ${property.title}` : "Agregar Nueva Propiedad"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Información General */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Información General</h3>
            <div className="flex flex-col gap-4">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="title" className="font-semibold text-foreground">Título</Label>
                  <Input id="title" {...register("title")} className="bg-card" />
                  {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="precio" className="font-semibold text-foreground">Precio</Label>
                  <Input id="precio" type="number" {...register("precio", { valueAsNumber: true })} className="bg-card" />
                  {errors.precio && <span className="text-xs text-red-500">{errors.precio.message}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direccion" className="font-semibold text-foreground">Dirección</Label>
                <Input id="direccion" {...register("direccion")} className="bg-card" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-foreground">Tipo de Venta</Label>
                <Controller
                  name="ventaType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Seleccionar tipo de venta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Al contado">Al contado</SelectItem>
                        <SelectItem value="Transacción bancaria">Transacción bancaria</SelectItem>
                        <SelectItem value="BIESS">BIESS</SelectItem>
                        <SelectItem value="Fraccionado">Fraccionado</SelectItem>
                        <SelectItem value="Promesa de compra-venta">Promesa de compra-venta</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="propertyOwner" className="font-semibold text-foreground">Propietario</Label>
                <Input id="propertyOwner" {...register("propertyOwner")} placeholder="Nombre del propietario" className="bg-card" />
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
                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.provincia && <span className="text-xs text-red-500">{errors.provincia.message}</span>}
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
                            <SelectItem key={ciudad} value={ciudad}>{ciudad}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ciudad && <span className="text-xs text-red-500">{errors.ciudad.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Tipo de propiedad</Label>
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
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
                        <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="vendida">Vendida</SelectItem>
                          <SelectItem value="negociación">Negociación</SelectItem>
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
            <h3 className="text-lg font-bold text-foreground mb-4">Detalles Técnicos</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaTotales" className="font-semibold text-foreground">m² totales</Label>
                  <Input id="areaTotales" type="number" {...register("areaTotales", { valueAsNumber: true })} className="bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="areaConstruccion" className="font-semibold text-foreground">m² construcción</Label>
                  <Input id="areaConstruccion" type="number" {...register("areaConstruccion", { valueAsNumber: true })} className="bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="habitaciones" className="font-semibold text-foreground">Habitaciones</Label>
                  <Input id="habitaciones" type="number" {...register("habitaciones", { valueAsNumber: true })} className="bg-card" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="banos" className="font-semibold text-foreground">Baños</Label>
                  <Input id="banos" type="number" {...register("banos", { valueAsNumber: true })} className="bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-semibold text-foreground">Antigüedad</Label>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="antiguedadEsNuevo"
                      control={control}
                      render={({ field }) => (
                        <Checkbox id="antiguedadEsNuevo" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                      )}
                    />
                    <Label htmlFor="antiguedadEsNuevo" className="text-sm font-normal text-foreground cursor-pointer">Nuevo</Label>
                  </div>
                  {!antiguedadEsNuevo && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input type="number" {...register("antiguedadAnos", { valueAsNumber: true })} placeholder="Años" className="bg-card" />
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
              <Label htmlFor="descripcion" className="font-semibold text-foreground">Descripción</Label>
              <Textarea id="descripcion" {...register("descripcion")} rows={5} className="bg-card resize-y" />
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Características</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "garaje", label: "Garaje" },
                { id: "piscina", label: "Piscina" },
                { id: "patio", label: "Patio" },
                { id: "seguridadPrivada", label: "Seguridad privada" },
                { id: "balcon", label: "Balcón" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Controller
                    name={id as any}
                    control={control}
                    render={({ field }) => (
                      <Checkbox id={id} checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                    )}
                  />
                  <Label htmlFor={id} className="text-sm font-normal text-foreground cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles de Construcción */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Detalles de Construcción</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="numeroPisos" className="font-semibold text-foreground">Número de pisos</Label>
              <Input id="numeroPisos" type="number" {...register("numeroPisos", { valueAsNumber: true })} placeholder="0, 1, 2, 3..." className="bg-card w-24" />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Ubicación</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Copia el código embed de Google Maps o la URL completa del lugar
            </p>
            <MapPreview mapsUrl={mapsUrl} onUrlChange={(url) => setValue("mapsUrl", url)} />
          </div>

          {/* Imágenes */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Imágenes</h3>

            {(imagenes.length > 0 || media.pendingFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imagenes.map((imagen, idx) => (
                  <div key={`exist-${idx}-${imagen.slice(-20)}`} className="relative group">
                    <img src={imagen} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-md bg-muted" />
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault()
                        if (!confirm("¿Deseas eliminar esta imagen?")) return
                        try {
                          await deleteImageFromSupabase(imagen)
                          setValue("imagenes", imagenes.filter((_, i) => i !== idx))
                        } catch (error) {
                          console.error("Error deleting image:", error)
                          alert("Error al eliminar la imagen. Por favor intenta de nuevo.")
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {media.pendingFiles.map((p) => (
                  <div key={p.id} className="relative group">
                    <img src={p.url} alt="Nueva imagen" className="w-full h-24 object-cover rounded-md bg-muted" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (!confirm("¿Deseas eliminar esta imagen?")) return
                        media.removeImage(p.id)
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full cursor-pointer rounded-md border-2 border-dashed border-border bg-muted/50 py-10 gap-2 hover:bg-muted/70 transition-colors"
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) media.addImages(e.dataTransfer.files) }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                onChange={(e) => { if (e.target.files?.length) { media.addImages(e.target.files); e.target.value = "" } }}
                className="sr-only"
                tabIndex={-1}
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm text-accent-foreground font-medium">Arrastra imágenes aquí o haz click para seleccionar</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</span>
              </div>
            </label>
          </div>

          {/* Videos */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Videos</h3>

            {(media.existingVideos.length > 0 || media.pendingVideos.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {media.existingVideos.map((video, idx) => (
                  <div key={`exist-video-${idx}-${video.slice(-20)}`} className="relative group">
                    <video src={video} className="w-full h-24 object-cover rounded-md bg-muted" muted playsInline />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (!confirm("¿Deseas eliminar este video?")) return
                        media.markVideoForDeletion(video, idx)
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {media.pendingVideos.map((p) => (
                  <div key={p.id} className="relative group">
                    <video src={p.url} className="w-full h-24 object-cover rounded-md bg-muted" muted playsInline />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (!confirm("¿Deseas eliminar este video?")) return
                        media.removeVideo(p.id)
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full cursor-pointer rounded-md border-2 border-dashed border-border bg-muted/50 py-10 gap-2 hover:bg-muted/70 transition-colors"
            >
              <input
                ref={videoInputRef}
                id="video-upload"
                type="file"
                multiple
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={(e) => { if (e.target.files?.length) { media.addVideos(e.target.files); e.target.value = "" } }}
                className="sr-only"
                tabIndex={-1}
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm text-accent-foreground font-medium">Arrastra videos aquí o haz click para seleccionar</span>
                <span className="text-xs text-muted-foreground">MP4, WebM, OGG hasta 50MB</span>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-card text-foreground cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-foreground text-card hover:bg-foreground/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Guardando..." : property ? "Guardar cambios" : "Guardar propiedad"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}