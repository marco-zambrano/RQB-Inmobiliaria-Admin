export type PropertyStatus = "disponible" | "reservada" | "vendida"

export type PropertyType = "apartment" | "house" | "penthouse" | "loft"

export interface Property {
  id: string
  nombre: string
  descripcionBreve: string
  descripcionLarga: string
  precio: number
  tipo: PropertyType
  zona: string
  habitaciones: number
  banos: number
  areaTotales: number
  areaConstruccion: number
  antiguedad: string
  direccion: string
  imagenes: string[]
  caracteristicas: {
    garaje: boolean
    piscina: boolean
    patio: boolean
    seguridadPrivada: boolean
    balcon: boolean
  }
  estado: PropertyStatus
  fecha: string
  latitud: string
  longitud: string
}
