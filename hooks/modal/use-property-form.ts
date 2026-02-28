import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Property } from "@/lib/types"

export const propertySchema = z.object({
    title: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    precio: z.number().min(0, "El precio debe ser mayor a 0"),
    direccion: z.string().optional(),
    provincia: z.string().min(1, "Selecciona una provincia"),
    ciudad: z.string().min(1, "Selecciona una ciudad"),
    tipo: z.enum(["local", "apartamento", "casa", "terreno", "casa rentera"]),
    estado: z.enum(["disponible", "vendida", "negociación"]),
    ventaType: z.enum(["Al contado", "Transacción bancaria", "BIESS", "Fraccionado", "Promesa de compra-venta"]).optional(),
    propertyOwner: z.string().optional(),
    areaTotales: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    areaConstruccion: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    habitaciones: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    banos: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    antiguedadEsNuevo: z.boolean(),
    antiguedadAnos: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    descripcion: z.string().optional(),
    garaje: z.boolean(),
    piscina: z.boolean(),
    patio: z.boolean(),
    seguridadPrivada: z.boolean(),
    balcon: z.boolean(),
    numeroPisos: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
        if (val === "" || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).refine((val) => val === undefined || val >= 0, "El valor debe ser mayor o igual a 0").optional(),
    mapsUrl: z.string().optional(),
    imagenes: z.array(z.string()),
})

export type PropertyFormData = z.infer<typeof propertySchema>

const emptyDefaults: PropertyFormData = {
    title: "", precio: undefined as any, direccion: "", provincia: "",
    ciudad: "", tipo: "apartamento", estado: "disponible", ventaType: undefined,
    propertyOwner: undefined, areaTotales: undefined, areaConstruccion: undefined,
    habitaciones: undefined, banos: undefined, antiguedadEsNuevo: false,
    antiguedadAnos: undefined, descripcion: "", garaje: false, piscina: false,
    patio: false, seguridadPrivada: false, balcon: false, numeroPisos: undefined,
    mapsUrl: "", imagenes: [],
}

export function usePropertyForm(property: Property | null | undefined, open: boolean) {
    const form = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: emptyDefaults,
    })

    useEffect(() => {
        if (!open) return

        if (property) {
            const featuresSet = new Set(property.features ?? [])
            const pisosFeature = Array.from(featuresSet).find((f) => f.includes("piso"))
            const numeroPisos = pisosFeature
                ? parseInt(pisosFeature.match(/(\d+)\s*piso?s?/)?.[1] ?? "0")
                : undefined

            form.reset({
                title: property.title,
                precio: property.price,
                direccion: property.address,
                provincia: property.province,
                ciudad: property.city,
                ventaType: property.venta_type as any,
                propertyOwner: property.property_owner ?? undefined,
                tipo: property.property_type,
                estado: property.status,
                areaTotales: property.sqm_total ?? undefined,
                areaConstruccion: property.sqm_built ?? undefined,
                habitaciones: property.bedrooms ?? undefined,
                banos: property.bathrooms ?? undefined,
                antiguedadEsNuevo: property.antiquity_years === 0,
                antiguedadAnos: property.antiquity_years || undefined,
                descripcion: property.description ?? "",
                garaje: featuresSet.has("garaje"),
                piscina: featuresSet.has("piscina"),
                patio: featuresSet.has("patio"),
                seguridadPrivada: featuresSet.has("seguridadPrivada"),
                balcon: featuresSet.has("balcon"),
                numeroPisos,
                mapsUrl: property.map_url || "",
                imagenes: (property.images ?? []).map((i) => i.image_url),
            })
        } else {
            form.reset(emptyDefaults)
        }
    }, [property, open])

    return form
}