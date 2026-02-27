// =========================
// ENUMS
// =========================
export type PropertyType = 'local' | 'apartamento' | 'casa' | 'terreno' | 'casa rentera'
export type PropertyStatus = 'disponible' | 'vendida' | 'negociación'

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

  antiquity_years: number | null

  description: string

  features: string[]
  map_url: string

  interest_level: number

  sold_at: string | null
  created_at: string

  venta_type: string | null
  property_owner: string | null

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