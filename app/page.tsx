"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PropertiesTable, PropertiesCards } from "@/components/properties-table"
import { PropertiesFilters } from "@/components/properties-filters"
import { PropertyModal } from "@/components/property-modal"
import { DeleteDialog } from "@/components/delete-dialog"
import { DashboardView } from "@/components/dashboard-view"
import { supabase, STORAGE_BUCKET, extractFilePathFromStorageUrl } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import AuthGuard from "@/components/auth-guard"
import { useProperties } from "@/hooks/use-properties"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("propiedades")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvincia, setSelectedProvincia] = useState("all")
  const [selectedEstado, setSelectedEstado] = useState("all")
  const [selectedTipo, setSelectedTipo] = useState("all")

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  const isMobile = useIsMobile()
  const { properties, setProperties, loading, error } = useProperties()

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch = (p.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesProvincia =
        selectedProvincia === "all" || p.province === selectedProvincia
      const matchesEstado =
        selectedEstado === "all" || p.status === selectedEstado
      const matchesTipo =
        selectedTipo === "all" || p.property_type === selectedTipo
      return matchesSearch && matchesProvincia && matchesEstado && matchesTipo
    })
  }, [properties, searchQuery, selectedProvincia, selectedEstado, selectedTipo])

  function handleAdd() {
    setEditingProperty(null)
    setModalOpen(true)
  }

  function handleEdit(property: Property) {
    setEditingProperty(property)
    setModalOpen(true)
  }

  function handleDelete(property: Property) {
    setDeletingProperty(property)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deletingProperty) return
    try {
      const id = deletingProperty.id

      // obtener imágenes y videos al mismo tiempo
      const [{ data: images }, { data: videos }] = await Promise.all([
        supabase.from("property_images").select("image_url").eq("property_id", id),
        supabase.from("property_videos").select("video_url").eq("property_id", id),
      ])

      const pathsToRemove: string[] = []
      for (const im of images ?? []) {
        try { pathsToRemove.push(extractFilePathFromStorageUrl(im.image_url)) } catch { /* ignore */ }
      }
      for (const v of videos ?? []) {
        try { pathsToRemove.push(extractFilePathFromStorageUrl(v.video_url)) } catch { /* ignore */ }
      }

      // Eliminar storage + registros de imágenes y videos al mismo tiempo
      await Promise.all([
        pathsToRemove.length > 0
          ? supabase.storage.from(STORAGE_BUCKET).remove(pathsToRemove)
          : Promise.resolve(),
        supabase.from("property_images").delete().eq("property_id", id),
        supabase.from("property_videos").delete().eq("property_id", id),
      ])

      const { error: delErr } = await supabase.from("properties").delete().eq("id", id)
      if (delErr) throw delErr

      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
      alert("Error al eliminar la propiedad. Revisa la consola.")
    } finally {
      setDeleteDialogOpen(false)
      setDeletingProperty(null)
    }
  }

  // ✅ Async directo, sin anidamiento
  async function handleSave(data: Omit<Property, "id">, videos?: string[]) {
    try {
      if (editingProperty) {
        const { images: _imgs, ...dbData } = data

        const imageUrls = (Array.isArray(_imgs)
          ? _imgs.map((img) => (typeof img === "string" ? img : img.image_url))
          : []
        ).filter((url) => !url.startsWith("blob:"))

        // Actualizar propiedad + obtener videos existentes al mismo tiempo
        const [{ data: updated, error: updateErr }, { data: existingVids }] = await Promise.all([
          supabase.from("properties").update(dbData).eq("id", editingProperty.id).select().single(),
          supabase.from("property_videos").select("id, property_id, video_url, created_at").eq("property_id", editingProperty.id),
        ])
        if (updateErr) throw updateErr

        // Reemplazar imágenes y gestionar videos al mismo tiempo
        const existingVideoUrls = (existingVids ?? []).map((v) => v.video_url)
        const videosToDelete = existingVideoUrls.filter((url) => !(videos ?? []).includes(url))
        const newVideoUrls = (videos ?? []).filter((url) => !existingVideoUrls.includes(url))

        await Promise.all([
          (async () => {
            await supabase.from("property_images").delete().eq("property_id", editingProperty.id)
            if (imageUrls.length > 0) {
              await supabase.from("property_images").insert(
                imageUrls.map((url) => ({ property_id: editingProperty.id, image_url: url }))
              )
            }
          })(),
          // Videos: delete los removidos
          videosToDelete.length > 0
            ? supabase.from("property_videos").delete().in("video_url", videosToDelete)
            : Promise.resolve(),
          // Videos: insert los nuevos
          newVideoUrls.length > 0
            ? supabase.from("property_videos").insert(newVideoUrls.map((url) => ({ property_id: editingProperty.id, video_url: url })))
            : Promise.resolve(),
        ])

        // Fetch final de imgs y vids al mismo tiempo
        const [{ data: imgs }, { data: vids }] = await Promise.all([
          supabase.from("property_images").select("id, property_id, image_url, created_at").eq("property_id", editingProperty.id),
          supabase.from("property_videos").select("id, property_id, video_url, created_at").eq("property_id", editingProperty.id),
        ])

        setProperties((prev) =>
          prev.map((p) =>
            p.id === editingProperty.id
              ? { ...updated, images: imgs ?? [], videos: vids ?? [] }
              : p
          )
        )
      } else {
        const { images: _imgs, ...dbData } = data

        const imageUrls = (Array.isArray(_imgs)
          ? _imgs.map((img) => (typeof img === "string" ? img : img.image_url))
          : []
        ).filter((url) => !url.startsWith("blob:"))

        const { data: created, error: insertErr } = await supabase
          .from("properties")
          .insert([dbData])
          .select()
          .single()
        if (insertErr) throw insertErr

        // Insertar imágenes y videos al mismo tiempo
        await Promise.all([
          imageUrls.length > 0
            ? supabase.from("property_images").insert(imageUrls.map((url) => ({ property_id: created.id, image_url: url })))
            : Promise.resolve(),
          (videos ?? []).length > 0
            ? supabase.from("property_videos").insert((videos ?? []).map((url) => ({ property_id: created.id, video_url: url })))
            : Promise.resolve(),
        ])

        // Fetch final
        const [{ data: imgs }, { data: vids }] = await Promise.all([
          supabase.from("property_images").select("id, property_id, image_url, created_at").eq("property_id", created.id),
          supabase.from("property_videos").select("id, property_id, video_url, created_at").eq("property_id", created.id),
        ])

        setProperties((prev) => [...prev, { ...created, images: imgs ?? [], videos: vids ?? [] }])
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Error al guardar la propiedad. Revisa la consola.")
    }
  }

  function handleClearFilters() {
    setSearchQuery("")
    setSelectedProvincia("all")
    setSelectedEstado("all")
    setSelectedTipo("all")
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
      {!isMobile && (
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <main
        className={`flex-1 ${isMobile ? "px-4 py-6" : "ml-52.5 px-8 py-8"}`}
      >
        {activeTab === "dashboard" && (
          <DashboardView properties={properties} />
        )}

        {activeTab === "propiedades" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Gestion de Propiedades
              </h1>
              <Button onClick={handleAdd} className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                Agregar nueva propiedad
              </Button>
            </div>

            <PropertiesFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedProvincia={selectedProvincia}
              onProvinciaChange={setSelectedProvincia}
              selectedEstado={selectedEstado}
              onEstadoChange={setSelectedEstado}
              selectedTipo={selectedTipo}
              onTipoChange={setSelectedTipo}
              onClearFilters={handleClearFilters}
            />

            {isMobile ? (
              <PropertiesCards
                properties={filteredProperties}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <PropertiesTable
                properties={filteredProperties}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                activeTab === "dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("propiedades")}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                activeTab === "propiedades"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Propiedades
            </button>
          </nav>
        )}
      </main>

      <PropertyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        property={editingProperty}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        property={deletingProperty}
        onConfirm={handleConfirmDelete}
      />
    </div>
    </AuthGuard>
  )
}
