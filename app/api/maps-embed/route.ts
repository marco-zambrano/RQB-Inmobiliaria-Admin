export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    // Seguir redirecciones para obtener la URL larga
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    const longUrl = res.url;

    let embedUrl: string | null = null;

    if (longUrl.includes("google.com/maps")) {
      try {
        // Intentar obtener el HTML de la página para extraer la URL de embed completa
        const pageResponse = await fetch(longUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        
        const html = await pageResponse.text();
        
        // Buscar la URL de embed completa en el HTML
        const embedMatch = html.match(/https:\/\/www\.google\.com\/maps\/embed\?pb=([^"'\s]+)/);
        if (embedMatch && embedMatch[0]) {
          embedUrl = embedMatch[0].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&').trim();
        }
      } catch (htmlError) {
        // Si falla la extracción del HTML, usar el método de coordenadas como fallback
      }
      
      // Si no se encontró la URL de embed completa, usar coordenadas
      if (!embedUrl) {
        const coordMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&output=embed&z=18`;
        }
      }
    }

    return Response.json({ embedUrl });
  } catch {
    return Response.json({ embedUrl: null });
  }
}
