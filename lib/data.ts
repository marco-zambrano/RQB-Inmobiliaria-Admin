import type { Property } from "./types"

// Provincias y ciudades del Ecuador
export const provinciasEcuador = {
  Azuay: [
    "Cuenca","Camilo Ponce Enriquez","Chordeleg","El Pan","Giron",
    "Gualaceo","Guachapala","Nabon","Oña","Paute",
    "Pucara","San Fernando","Santa Isabel","Sevilla de Oro","Sigsig"
  ],

  Bolivar: [
    "Guaranda","Caluma","Chillanes","Chimbo",
    "Echeandia","Las Naves","San Miguel"
  ],

  Cañar: [
    "Azogues","Biblián","Cañar","Déleg",
    "El Tambo","La Troncal","Suscal"
  ],

  Carchi: [
    "Tulcan","Bolivar","Espejo","Mira",
    "Montufar","San Pedro de Huaca"
  ],

  Chimborazo: [
    "Riobamba","Alausi","Chambo","Chunchi",
    "Colta","Cumanda","Guamote","Guano",
    "Pallatanga","Penipe"
  ],

  Cotopaxi: [
    "Latacunga","La Mana","Pangua",
    "Pujili","Salcedo","Saquisili","Sigchos"
  ],

  El_Oro: [
    "Machala","Arenillas","Atahualpa","Balsas",
    "Chilla","El Guabo","Huaquillas","Las Lajas",
    "Marcabeli","Pasaje","Piñas","Portovelo",
    "Santa Rosa","Zaruma"
  ],

  Esmeraldas: [
    "Esmeraldas","Atacames","Eloy Alfaro",
    "Muisne","Quininde","Rioverde","San Lorenzo"
  ],

  Galapagos: [
    "San Cristobal","Isabela","Santa Cruz"
  ],

  Guayas: [
    "Guayaquil","Alfredo Baquerizo Moreno","Balao","Balzar",
    "Colimes","Daule","Duran","El Empalme","El Triunfo",
    "General Antonio Elizalde","Isidro Ayora","Lomas de Sargentillo",
    "Marcelino Maridueña","Milagro","Naranjal","Naranjito",
    "Nobol","Palestina","Pedro Carbo","Playas",
    "Salitre","Samborondon","Santa Lucia",
    "Simon Bolivar","Yaguachi"
  ],

  Imbabura: [
    "Ibarra","Antonio Ante","Cotacachi",
    "Otavalo","Pimampiro","San Miguel de Urcuqui"
  ],

  Loja: [
    "Loja","Calvas","Catamayo","Celica",
    "Chaguarpamba","Espindola","Gonzanama","Macara",
    "Olmedo","Paltas","Pindal","Puyango",
    "Quilanga","Saraguro","Sozoranga","Zapotillo"
  ],

  Los_Rios: [
    "Babahoyo","Baba","Buena Fe","Mocache",
    "Montalvo","Palenque","Puebloviejo",
    "Quevedo","Quinsaloma","Urdaneta",
    "Valencia","Ventanas","Vinces"
  ],

  Manabi: [
    "Portoviejo","Bolivar","Chone","El Carmen",
    "Flavio Alfaro","Jama","Jaramijo","Jipijapa",
    "Junin","Manta","Montecristi","Olmedo",
    "Pajan","Pedernales","Pichincha",
    "Puerto Lopez","Rocafuerte","San Vicente",
    "Santa Ana","Sucre","Tosagua","24 de Mayo"
  ],

  Morona_Santiago: [
    "Macas","Gualaquiza","Huamboya","Limón Indanza",
    "Logroño","Morona","Pablo Sexto",
    "Palora","San Juan Bosco","Santiago",
    "Sucua","Taisha","Tiwintza"
  ],

  Napo: [
    "Tena","Archidona",
    "Carlos Julio Arosemena Tola",
    "El Chaco","Quijos"
  ],

  Orellana: [
    "Francisco de Orellana","Aguarico",
    "La Joya de los Sachas","Loreto"
  ],

  Pastaza: [
    "Puyo","Arajuno","Mera","Santa Clara"
  ],

  Pichincha: [
    "Quito","Cayambe","Mejia","Pedro Moncayo",
    "Rumiñahui","San Miguel de los Bancos",
    "Pedro Vicente Maldonado","Puerto Quito"
  ],

  Santa_Elena: [
    "Santa Elena","La Libertad","Salinas"
  ],

  Santo_Domingo_de_los_Tsachilas: [
    "Santo Domingo","La Concordia"
  ],

  Sucumbios: [
    "Lago Agrio","Cascales",
    "Cuyabeno","Gonzalo Pizarro",
    "Putumayo","Shushufindi","Sucumbios"
  ],

  Tungurahua: [
    "Ambato","Baños de Agua Santa","Cevallos",
    "Mocha","Patate","Pelileo",
    "Pillaro","Quero","Tisaleo"
  ],

  Zamora_Chinchipe: [
    "Zamora","Centinela del Condor","Chinchipe",
    "El Pangui","Nangaritza","Palanda",
    "Paquisha","Yacuambi","Yantzaza"
  ]
};

export const initialProperties: Property[] = [
  {
    id: "1",
    nombre: "Casa Moderna en Pichincha",
    descripcion: "Hermosa casa moderna con acabados de lujo, amplios espacios y jardin privado. Ubicada en una de las mejores zonas del norte de la ciudad con facil acceso a vias principales.",
    precio: 450000,
    tipo: "casa",
    provincia: "Pichincha",
    ciudad: "Quito",
    habitaciones: 4,
    banos: 3,
    areaTotales: 300,
    areaConstruccion: 250,
    antiguedad: {
      esNuevo: false,
      anos: 5,
    },
    direccion: "Calle 120 #45-67, Zona Norte",
    imagenes: ["/images/casa-moderna.jpg"],
    caracteristicas: {
      garaje: true,
      piscina: true,
      patio: true,
      seguridadPrivada: true,
      balcon: false,
      dospisos: false,
      trespisos: false,
    },
    estado: "disponible",
    fecha: "2024-01-15",
    mapsUrl: "",
  },
  {
    id: "2",
    nombre: "Apartamento Penthouse Guayas",
    descripcion: "Espectacular penthouse con vista panoramica al centro de la ciudad. Acabados de primera, terraza amplia y zonas comunes de lujo.",
    precio: 380000,
    tipo: "apartamento",
    provincia: "Guayas",
    ciudad: "Guayaquil",
    habitaciones: 3,
    banos: 2,
    areaTotales: 200,
    areaConstruccion: 180,
    antiguedad: {
      esNuevo: true,
      anos: 0,
    },
    direccion: "Segundo piso, Zona Centro",
    imagenes: ["/images/apartamento-penthouse.jpg"],
    caracteristicas: {
      garaje: true,
      piscina: false,
      patio: false,
      seguridadPrivada: true,
      balcon: true,
      dospisos: false,
      trespisos: false,
    },
    estado: "disponible",
    fecha: "2024-01-20",
    mapsUrl: "",
  },
  {
    id: "3",
    nombre: "Casa Campestre Manabi",
    descripcion: "Acogedora casa campestre con diseno contemporaneo en zona exclusiva. Amplio jardin, chimenea y zona BBQ perfecta para familias.",
    precio: 520000,
    tipo: "negocio",
    provincia: "Manabi",
    ciudad: "Manta",
    habitaciones: 5,
    banos: 4,
    areaTotales: 400,
    areaConstruccion: 350,
    antiguedad: {
      esNuevo: false,
      anos: 10,
    },
    direccion: "Zona Costera Premium",
    imagenes: ["/images/casa-campestre.jpg"],
    caracteristicas: {
      garaje: true,
      piscina: false,
      patio: true,
      seguridadPrivada: false,
      balcon: true,
      dospisos: true,
      trespisos: false,
    },
    estado: "vendida",
    fecha: "2024-02-01",
    mapsUrl: "",
  },
]

export const tiposPropiedad: { value: string; label: string }[] = [
  { value: "negocio", label: "Negocio" },
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
]
