// hooks/useProperties.ts

import { useState, useEffect } from "react"
import { Property } from "../lib/types"
import { supabase } from "../lib/supabaseClient"

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            property_images(id, property_id, image_url, created_at),
            property_videos(id, property_id, video_url, created_at)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        setProperties(
          (data ?? []).map((p) => ({
            ...p,
            images: p.property_images ?? [],
            videos: p.property_videos ?? [],
          }))
        )
      } catch (err) {
        setError(err as Error)
        console.error("Load error:", err)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return { properties, loading, error, setProperties }
}