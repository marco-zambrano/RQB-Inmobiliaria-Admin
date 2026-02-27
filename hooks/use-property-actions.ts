import { useState } from "react"
import { supabase, STORAGE_BUCKET, extractFilePathFromStorageUrl } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"

export function usePropertyActions(
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>
) {
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<Property | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

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

    async function handleSave(data: Omit<Property, "id">, videos?: string[]) {
        try {
            if (editingProperty) {
                const { images: _imgs, ...dbData } = data
                const imageUrls = (Array.isArray(_imgs)
                    ? _imgs.map((img) => (typeof img === "string" ? img : img.image_url))
                    : []
                ).filter((url) => !url.startsWith("blob:"))

                const [{ data: updated, error: updateErr }, { data: existingVids }] = await Promise.all([
                    supabase.from("properties").update(dbData).eq("id", editingProperty.id).select().single(),
                    supabase.from("property_videos").select("id, property_id, video_url, created_at").eq("property_id", editingProperty.id),
                ])
                if (updateErr) throw updateErr

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
                    videosToDelete.length > 0
                        ? supabase.from("property_videos").delete().in("video_url", videosToDelete)
                        : Promise.resolve(),
                    newVideoUrls.length > 0
                        ? supabase.from("property_videos").insert(newVideoUrls.map((url) => ({ property_id: editingProperty.id, video_url: url })))
                        : Promise.resolve(),
                ])

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
                    .from("properties").insert([dbData]).select().single()
                if (insertErr) throw insertErr

                await Promise.all([
                    imageUrls.length > 0
                        ? supabase.from("property_images").insert(imageUrls.map((url) => ({ property_id: created.id, image_url: url })))
                        : Promise.resolve(),
                    (videos ?? []).length > 0
                        ? supabase.from("property_videos").insert((videos ?? []).map((url) => ({ property_id: created.id, video_url: url })))
                        : Promise.resolve(),
                ])

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

    return {
        modalOpen, setModalOpen,
        editingProperty,
        deleteDialogOpen, setDeleteDialogOpen,
        deletingProperty,
        handleAdd, handleEdit, handleDelete,
        handleConfirmDelete, handleSave,
    }
}