"use client"

import { useState, useMemo } from "react"
import { Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertiesTable, PropertiesCards } from "@/components/properties-table"
import { PropertiesFilters } from "@/components/properties-filters"
import { PropertyModal } from "@/components/property-modal"
import { DeleteDialog } from "@/components/delete-dialog"
import { supabase, STORAGE_BUCKET, extractFilePathFromStorageUrl } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import { useProperties } from "@/hooks/use-properties"
import { usePropertyFilters } from "@/hooks/use-property-filters"
import { usePropertyActions } from "@/hooks/use-property-actions"

export default function AdminPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { properties, setProperties, loading, error } = useProperties()

  // Filters hooks
  const { filteredProperties, 
    searchQuery, setSearchQuery, 
    selectedProvincia, setSelectedProvincia, 
    selectedEstado, setSelectedEstado, 
    selectedTipo, setSelectedTipo, 
    handleClearFilters } = usePropertyFilters(properties)

    const { handleAdd,
      handleEdit,
      handleDelete,
      handleConfirmDelete,
      handleSave,
      modalOpen, setModalOpen,
      editingProperty,
      deleteDialogOpen, setDeleteDialogOpen,
      deletingProperty } = usePropertyActions(setProperties)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-accent">
                <span className="text-sm font-bold text-accent-foreground">RQB</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-8">
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
