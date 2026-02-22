"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Property } from "@/lib/types"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property | null
  onConfirm: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  property,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Eliminar propiedad
          </AlertDialogTitle>
          <AlertDialogDescription>
            {'Esta accion no se puede deshacer. Se eliminara permanentemente '}
            <span className="font-semibold text-foreground">
              {property?.title}
            </span>
            {' del sistema.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
