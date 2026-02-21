export type PropertyStatus = "disponible" | "vendida"

export type PropertyType = "negocio" | "apartamento" | "casa"

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
  fechaVendida?: string
  mapsUrl: string
}
