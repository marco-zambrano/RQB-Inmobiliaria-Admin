import { useState, useMemo } from "react"
import type { Property } from "@/lib/types"

export function usePropertyFilters(properties: Property[]) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProvincia, setSelectedProvincia] = useState("all")
    const [selectedEstado, setSelectedEstado] = useState("all")
    const [selectedTipo, setSelectedTipo] = useState("all")

    const filteredProperties = useMemo(() => {
        return properties.filter((p) => {
            const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase())
            const matchesProvincia = selectedProvincia === "all" || p.province === selectedProvincia
            const matchesEstado = selectedEstado === "all" || p.status === selectedEstado
            const matchesTipo = selectedTipo === "all" || p.property_type === selectedTipo
            return matchesSearch && matchesProvincia && matchesEstado && matchesTipo
        })
    }, [properties, searchQuery, selectedProvincia, selectedEstado, selectedTipo])

    function handleClearFilters() {
        setSearchQuery("")
        setSelectedProvincia("all")
        setSelectedEstado("all")
        setSelectedTipo("all")
    }

    return {
        filteredProperties,
        searchQuery, setSearchQuery,
        selectedProvincia, setSelectedProvincia,
        selectedEstado, setSelectedEstado,
        selectedTipo, setSelectedTipo,
        handleClearFilters,
    }
}