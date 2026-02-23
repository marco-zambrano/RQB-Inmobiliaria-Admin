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
import { initialProperties } from "@/lib/data"
import { supabase, STORAGE_BUCKET, extractFilePathFromStorageUrl } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import AuthGuard from "@/components/auth-guard"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("propiedades")
  const [properties, setProperties] = useState<Property[]>([])

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

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select(`*, property_images(id, property_id, image_url, created_at)`)
          .order("created_at", { ascending: false })

        if (error) throw error

        const props = (data || []).map((p: any) => ({
          ...p,
          images: (p.property_images || []).map((i: any) => ({
            id: i.id ?? "",
            property_id: p.id,
            image_url: i.image_url,
            created_at: i.created_at ?? "",
          })),
        }))

        setProperties(props)
      } catch (err) {
        console.error("Load error:", err)
      }
    }

    void load()
  }, [])

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

  function handleConfirmDelete() {
    const doDelete = async () => {
      if (!deletingProperty) return
      try {
        const id = deletingProperty.id

        // obtener assets relacionados
        const { data: images } = await supabase
          .from("property_images")
          .select("image_url")
          .eq("property_id", id)

        const { data: videos } = await supabase
          .from("property_videos")
          .select("video_url")
          .eq("property_id", id)

        const pathsToRemove: string[] = []

        if (images) {
          for (const im of images) {
            try {
              pathsToRemove.push(extractFilePathFromStorageUrl(im.image_url))
            } catch (e) {
              // ignore
            }
          }
        }

        if (videos) {
          for (const v of videos) {
            try {
              pathsToRemove.push(extractFilePathFromStorageUrl(v.video_url))
            } catch (e) {
              // ignore
            }
          }
        }

        if (pathsToRemove.length > 0) {
          const { error: storageErr } = await supabase.storage.from(STORAGE_BUCKET).remove(pathsToRemove)
          if (storageErr) console.error("Storage remove error:", storageErr)
        }

        await supabase.from("property_images").delete().eq("property_id", id)
        await supabase.from("property_videos").delete().eq("property_id", id)
        const { error: delErr } = await supabase.from("properties").delete().eq("id", id)
        if (delErr) throw delErr

        setProperties((prev) => prev.filter((p) => p.id !== id))
      } catch (error) {
        console.error("Delete error:", error)
        alert("Error al eliminar la propiedad. Revisa la consola.")
      } finally {
        setDeleteDialogOpen(false)
        setDeletingProperty(null)
      }
    }

    void doDelete()
  }

  function handleSave(data: Omit<Property, "id">) {
    const doSave = async () => {
      try {
        if (editingProperty) {
          const { images: _imgs, ...dbData } = data
          const { data: updated, error: updateErr } = await supabase
            .from("properties")
            .update(dbData)
            .eq("id", editingProperty.id)
            .select()
            .single()

          if (updateErr) throw updateErr

          const imageUrls = (Array.isArray(_imgs)
            ? _imgs.map((img) => (typeof img === "string" ? img : img.image_url))
            : []
          ).filter((url) => !url.startsWith("blob:"))
          await supabase.from("property_images").delete().eq("property_id", editingProperty.id)
          if (imageUrls.length > 0) {
            const imagesToInsert = imageUrls.map((url) => ({ property_id: editingProperty.id, image_url: url }))
            await supabase.from("property_images").insert(imagesToInsert)
          }

          const { data: imgs } = await supabase.from("property_images").select("id, property_id, image_url, created_at").eq("property_id", editingProperty.id)

          setProperties((prev) =>
            prev.map((p) =>
              p.id === editingProperty.id
                ? { ...updated, images: (imgs || []).map((i) => ({ id: i.id, property_id: i.property_id, image_url: i.image_url, created_at: i.created_at })) }
                : p
            )
          )
        } else {
          const { images: _imgs, ...dbData } = data
          const imageUrls = (Array.isArray(_imgs)
            ? _imgs.map((img) => (typeof img === "string" ? img : img.image_url))
            : []
          ).filter((url) => !url.startsWith("blob:"))
          const { data: created, error: insertErr } = await supabase.from("properties").insert([dbData]).select().single()
          if (insertErr) throw insertErr

          if (imageUrls.length > 0) {
            const imagesToInsert = imageUrls.map((url) => ({ property_id: created.id, image_url: url }))
            await supabase.from("property_images").insert(imagesToInsert)
          }

          const { data: imgs } = await supabase.from("property_images").select("id, property_id, image_url, created_at").eq("property_id", created.id)
          setProperties((prev) => [...prev, { ...created, images: (imgs || []).map((i) => ({ id: i.id, property_id: i.property_id, image_url: i.image_url, created_at: i.created_at })) }])
        }
      } catch (error) {
        console.error("Save error:", error)
        alert("Error al guardar la propiedad. Revisa la consola.")
      }
    }

    void doSave()
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
              <Button onClick={handleAdd} className="gap-2">
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
