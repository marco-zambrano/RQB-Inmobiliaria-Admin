import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte una URL "de compartir" de Google Maps (incluyendo los short links
 * tipo https://maps.app.goo.gl/xxxx) a una URL válida para <iframe>
 * (formato https://www.google.com/maps/embed?pb=...).
 *
 * IMPORTANTE: úsala SOLO en el servidor (API routes), por CORS y redirects.
 */
export async function toGoogleMapsEmbedUrl(rawUrl: string): Promise<string | null> {
  try {
    if (!rawUrl) return null

    let url = new URL(rawUrl.trim())

    // Si ya es una URL de embed (embed?pb=...), la devolvemos tal cual
    if (url.hostname.includes('google.') && url.pathname.startsWith('/maps/embed')) {
      return url.toString()
    }

    // Short link: seguir redirect en el servidor
    if (url.hostname === 'maps.app.goo.gl' || url.hostname.endsWith('.goo.gl')) {
      const res = await fetch(url.toString(), { redirect: 'follow' })
      url = new URL(res.url)
    }

    if (!url.hostname.includes('google.') || !url.pathname.startsWith('/maps')) {
      return null
    }

    // Si tras el redirect ya es embed, devolverla
    if (url.pathname.startsWith('/maps/embed')) {
      return url.toString()
    }

    // Es una URL de "place" (/maps/place/...). Esa URL no sirve en iframe;
    // necesitamos la URL real de embed (embed?pb=...). La intentamos extraer
    // de la propia página de Google Maps.
    const placePageUrl = url.toString()
    const htmlRes = await fetch(placePageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    const html = await htmlRes.text()

    // Buscar la URL de embed en el HTML (Google la incluye en scripts/datos)
    const fullUrlMatch = html.match(/https:\/\/www\.google\.com\/maps\/embed\?pb=([^"'\s]+)/)
    if (fullUrlMatch && fullUrlMatch[0]) {
      return fullUrlMatch[0].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&').trim()
    }
    // A veces solo está el parámetro pb= en JSON
    const pbMatch = html.match(/["']https:\\\\?\/\\\\?\/www\.google\.com\\\\?\/maps\\\\?\/embed\?pb=([^"'\s\\]+)/)
    if (pbMatch && pbMatch[1]) {
      const pb = pbMatch[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
      return `https://www.google.com/maps/embed?pb=${pb}`
    }

    // Fallback: construir una URL de embed por coordenadas si aparecen en la URL place
    // Ej: /place/Name/@-0.845,-80.15,15z o !3d-0.848!4d-80.158
    const atMatch = url.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    const d3Match = html.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
    const latLng = atMatch ? [atMatch[1], atMatch[2]] : d3Match ? [d3Match[1], d3Match[2]] : null
    if (latLng) {
      const [lat, lng] = latLng
      // Formato que funciona sin API key usando coordenadas
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    }

    return null
  } catch {
    return null
  }
}
