"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PropertiesTable, PropertiesCards } from "@/components/properties-table"
import { PropertiesFilters } from "@/components/properties-filters"
import { PropertyModal } from "@/components/property-modal"
import { DeleteDialog } from "@/components/delete-dialog"
import { DashboardView } from "@/components/dashboard-view"
import { initialProperties } from "@/lib/data"
import type { Property } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import AuthGuard from "@/components/auth-guard"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("propiedades")
  const [properties, setProperties] = useState<Property[]>(initialProperties)

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

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch = p.nombre
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesProvincia =
        selectedProvincia === "all" || p.provincia === selectedProvincia
      const matchesEstado =
        selectedEstado === "all" || p.estado === selectedEstado
      const matchesTipo =
        selectedTipo === "all" || p.tipo === selectedTipo
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
    if (deletingProperty) {
      setProperties((prev) =>
        prev.filter((p) => p.id !== deletingProperty.id)
      )
    }
    setDeleteDialogOpen(false)
    setDeletingProperty(null)
  }

  function handleSave(data: Omit<Property, "id">) {
    if (editingProperty) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id ? { ...data, id: p.id } : p
        )
      )
    } else {
      const newProperty: Property = {
        ...data,
        id: Date.now().toString(),
      }
      setProperties((prev) => [...prev, newProperty])
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
