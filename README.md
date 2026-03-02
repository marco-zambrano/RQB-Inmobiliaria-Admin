# RQB 593 - Admin

Panel de administración para gestión de propiedades inmobiliarias de RQB 593.

## 🚀 Características

- Gestión de propiedades inmobiliarias
- Subida de imágenes y videos a Supabase Storage
- Autenticación con Supabase Auth
- Interfaz moderna con Tailwind CSS y Radix UI
- Dashboard con analytics y métricas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16.1.6, React 19.2.4
- **Estilos**: Tailwind CSS 4.2.0, Radix UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Autenticación**: Supabase Auth
- **Maps**: Google Maps iframe tag
- **Formularios**: React Hook Form, Zod
- **Gráficos**: Recharts
- **TypeScript**: 5.7.3

## 📋 Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta de Supabase

## 🚀 Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd rqb-admin
```

2. Instalar dependencias
```bash
pnpm install
# o
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

4. Configurar las siguientes variables en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anon_de_supabase
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
pnpm dev
# o
npm run dev
```
Visita [http://localhost:3000](http://localhost:3000)

### Build para producción
```bash
pnpm build
# o
npm run build
```

### Iniciar servidor de producción
```bash
pnpm start
# o
npm run start
```

## 📁 Estructura del Proyecto

```
rqb-admin/
├── app/                    # App Router de Next.js
│   ├── api/               # Rutas API
│   ├── login/             # Página de login
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Dashboard
├── components/            # Componentes UI
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
│   └── supabaseClient.ts  # Cliente de Supabase
├── public/               # Archivos estáticos
└── styles/               # Estilos adicionales
```

## 🔧 Configuración de Supabase

1. Crear un nuevo proyecto en Supabase
2. Configurar las siguientes tablas:
   - `properties` - Propiedades inmobiliarias
   - `property_videos` - Videos de propiedades
3. Crear bucket de storage llamado `rqb-bucket`
4. Configurar políticas de acceso (RLS) según sea necesario

## 📸 Gestión de Archivos

- **Imágenes**: Se suben a Supabase Storage con URLs firmadas (1 año de expiración)
- **Videos**: Proceso similar a las imágenes con almacenamiento en el mismo bucket
- **Formatos soportados**: JPG, PNG, WebP para imágenes; MP4 para videos

## 🔐 Seguridad

- URLs firmadas con expiración de 1 año
- Variables de entorno correctamente configuradas
- Autenticación mediante Supabase Auth
- Políticas de seguridad en base de datos (RLS)

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente

### Otros proveedores
1. Build del proyecto: `npm run build`
2. Subir archivos generados en `.next`
3. Configurar servidor Node.js con `npm start`

## 🐛 Troubleshooting

### Build errors
- Verificar que las variables de entorno estén configuradas
- Asegurarse de que Supabase esté accesible

### Problemas con imágenes
- Verificar configuración del bucket en Supabase
- Revisar políticas de acceso (RLS)

### Problemas de conexión
- Verificar URL y clave de Supabase
- Revisar configuración de red

## 📝 Licencia

Proyecto privado para RQB 593

## 🤝 Contribución

Contactar con el equipo de desarrollo de RQB 593 para contribuciones.
