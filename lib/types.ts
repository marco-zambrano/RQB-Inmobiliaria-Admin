export type PropertyStatus = "disponible" | "reservada" | "vendida"

export type PropertyType = "apartment" | "house" | "penthouse" | "loft"

export interface Property {
  id: string
  nombre: string
  descripcion: string
  precio: number
  tipo: PropertyType
  provincia: string
  ciudad: string
  habitaciones: number
  banos: number
  areaTotales: number
  areaConstruccion: number
  antiguedad: {
    esNuevo: boolean
    anos: number
  }
  direccion: string
  imagenes: string[]
  caracteristicas: {
    garaje: boolean
    piscina: boolean
    patio: boolean
    seguridadPrivada: boolean
    balcon: boolean
    dospisos: boolean
    trespisos: boolean
  }
  estado: PropertyStatus
  fecha: string
  mapsUrl: string
}
