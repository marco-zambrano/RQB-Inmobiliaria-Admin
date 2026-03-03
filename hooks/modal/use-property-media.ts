import { useState } from "react"
import { uploadImageToSupabase, uploadVideoToSupabase, deleteVideoFromSupabase, deleteVideoFromDatabase, deleteImageFromSupabase } from "@/lib/supabaseClient"
import type { Property } from "@/lib/types"

type PendingFile = { id: string; url: string; file: File }

export function usePropertyMedia(property: Property | null | undefined) {
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
    const [pendingVideos, setPendingVideos] = useState<PendingFile[]>([])
    const [existingVideos, setExistingVideos] = useState<string[]>([])
    const [videosToDelete, setVideosToDelete] = useState<string[]>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    function initMedia() {
        setPendingFiles((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return [] })
        setPendingVideos((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return [] })
        setVideosToDelete([])
        setImagesToDelete([])
        setExistingVideos((property?.videos ?? []).map((v) => v.video_url))
    }

    function addImages(files: FileList) {
        const valid = Array.from(files).filter((f) =>
            ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif"].includes(f.type)
        )
        if (!valid.length) return
        setPendingFiles((prev) => [
            ...prev,
            ...valid.map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file), file })),
        ])
    }

    function removeImage(id: string) {
        setPendingFiles((prev) => {
            const found = prev.find((p) => p.id === id)
            if (found) URL.revokeObjectURL(found.url)
            return prev.filter((p) => p.id !== id)
        })
    }

    function addVideos(files: FileList) {
        const valid = Array.from(files).filter((f) =>
            ["video/mp4", "video/webm", "video/ogg", "video/quicktime"].includes(f.type)
        )
        if (!valid.length) return
        setPendingVideos((prev) => [
            ...prev,
            ...valid.map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file), file })),
        ])
    }

    function removeVideo(id: string) {
        setPendingVideos((prev) => {
            const found = prev.find((p) => p.id === id)
            if (found) URL.revokeObjectURL(found.url)
            return prev.filter((p) => p.id !== id)
        })
    }

    function markImageForDeletion(imageUrl: string, idx: number) {
        setImagesToDelete((prev) => [...prev, imageUrl])
    }

    function markVideoForDeletion(videoUrl: string, idx: number) {
        setVideosToDelete((prev) => [...prev, videoUrl])
        setExistingVideos((prev) => prev.filter((_, i) => i !== idx))
    }

    async function uploadAll() {
        const [urlsNuevas, videosNuevos] = await Promise.all([
            Promise.all(pendingFiles.map(async (p) => {
                const url = await uploadImageToSupabase(p.file)
                URL.revokeObjectURL(p.url)
                return url
            })),
            Promise.all(pendingVideos.map(async (p) => {
                const url = await uploadVideoToSupabase(p.file)
                URL.revokeObjectURL(p.url)
                return url
            })),
        ])
        return { urlsNuevas, videosNuevos }
    }

    async function deleteMarkedVideos() {
        if (!videosToDelete.length || !property?.videos) return
        await Promise.all(
            videosToDelete.map(async (videoUrl) => {
                try {
                    await deleteVideoFromSupabase(videoUrl)
                    const found = property.videos?.find((v) => v.video_url === videoUrl)
                    if (found?.id) await deleteVideoFromDatabase(found.id)
                } catch (err) {
                    console.error("Error eliminando video:", videoUrl, err)
                }
            })
        )
    }

    async function deleteMarkedImages() {
        if (!imagesToDelete.length) return
        await Promise.all(
            imagesToDelete.map(async (imageUrl) => {
                try {
                    await deleteImageFromSupabase(imageUrl)
                } catch (err) {
                    console.error("Error eliminando imagen:", imageUrl, err)
                }
            })
        )
    }

    function reset() {
        setPendingFiles([])
        setPendingVideos([])
        setVideosToDelete([])
        setImagesToDelete([])
    }

    return {
        pendingFiles, pendingVideos, existingVideos, videosToDelete, imagesToDelete,
        initMedia, addImages, removeImage, addVideos, removeVideo,
        markImageForDeletion, markVideoForDeletion, uploadAll, deleteMarkedVideos, deleteMarkedImages, reset,
    }
}