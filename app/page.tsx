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
import { supabase, STORAGE_BUCKET, extractFilePathFromStorageUrl } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import AuthGuard from "@/components/auth-guard"
import { useProperties } from "@/hooks/use-properties"
import { usePropertyFilters } from "@/hooks/use-property-filters"
import { usePropertyActions } from "@/hooks/use-property-actions"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("propiedades")

  // // Modals hooks
  // const [modalOpen, setModalOpen] = useState(false)
  // const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  // const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  const isMobile = useIsMobile()
  const { properties, setProperties, loading, error } = useProperties()

  // Filters hooks
  const { filteredProperties, 
    searchQuery, setSearchQuery, 
    selectedProvincia, setSelectedProvincia, 
    selectedEstado, setSelectedEstado, 
    selectedTipo, setSelectedTipo, 
    handleClearFilters } = usePropertyFilters(properties)

    const { handleAdd, handleEdit, handleDelete, handleConfirmDelete, handleSave, modalOpen, setModalOpen, editingProperty, deleteDialogOpen, setDeleteDialogOpen, deletingProperty } = usePropertyActions(setProperties)

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
