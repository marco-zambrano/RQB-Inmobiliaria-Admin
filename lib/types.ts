// =========================
// ENUMS
// =========================

export type PropertyType = 'negocio' | 'apartamento' | 'casa'
export type PropertyStatus = 'disponible' | 'vendida'

// =========================
// INTERFACES PRINCIPALES
// =========================

export interface Property {
  id: string
  title: string
  price: number

  address: string
  city: string
  province: string

  property_type: PropertyType
  status: PropertyStatus

  sqm_total: number | null
  sqm_built: number | null

  bedrooms: number | null
  bathrooms: number | null

  antiquity_years: number

  description: string | null

  features: string[]

  latitude: number | null
  longitude: number | null

  interest_level: number

  sold_at: string | null

  created_at: string

  // Relaciones (opcionales, se incluyen cuando se hace JOIN)
  images?: PropertyImage[]
  videos?: PropertyVideo[]
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  created_at: string
}

export interface PropertyVideo {
  id: string
  property_id: string
  video_url: string
  created_at: string
}

// =========================
// DTOs (para crear/actualizar)
// =========================

export interface CreatePropertyDTO {
  title: string
  price: number
  address: string
  city: string
  province: string
  property_type: PropertyType
  status?: PropertyStatus
  sqm_total?: number
  sqm_built?: number
  bedrooms?: number
  bathrooms?: number
  antiquity_years?: number
  description?: string
  features?: string[]
  latitude?: number
  longitude?: number
}

export interface UpdatePropertyDTO extends Partial<CreatePropertyDTO> {
  sold_at?: string
  interest_level?: number
}