"use client";

import { useEffect, useState } from "react";

interface MapPreviewProps {
  mapsUrl?: string;
  onUrlChange: (url: string) => void;
}

// Acepta tanto el enlace de compartir (maps.app.goo.gl, google.com/maps) como el embed o etiquetas iframe
function isAcceptableMapsInput(url: string): boolean {
  if (!url?.trim()) return false;
  const u = url.trim().toLowerCase();
  return (
    u.includes("google.com/maps") ||
    u.includes("gstatic.com") ||
    u.includes("maps.app.goo.gl") ||
    u.includes("goo.gl/maps") ||
    u.includes("<iframe")
  );
}

// Extrae la URL de embed de una etiqueta iframe completa
function extractEmbedUrlFromIframe(iframeHtml: string): string | null {
  const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
  if (srcMatch && srcMatch[1]) {
    const url = srcMatch[1];
    // Verificar que sea una URL de embed de Google Maps
    if (url.includes("google.com/maps/embed")) {
      return url;
    }
  }
  return null;
}

// Indica si la URL ya es una URL de iframe (embed)
function isEmbedUrl(url: string): boolean {
  return url.includes("google.com") && url.includes("/maps/embed");
}

export function MapPreview({ mapsUrl = "", onUrlChange }: MapPreviewProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const trimmed = mapsUrl?.trim() ?? "";
  const acceptable = isAcceptableMapsInput(trimmed);
  const showInvalid = trimmed.length > 0 && !acceptable;

  useEffect(() => {
    if (!trimmed) {
      setEmbedUrl(null);
      return;
    }
    
    // Verificar si es una etiqueta iframe completa
    if (trimmed.includes("<iframe")) {
      const extractedUrl = extractEmbedUrlFromIframe(trimmed);
      if (extractedUrl) {
        setEmbedUrl(extractedUrl);
        // Actualizar el valor del input con la URL extraída para que se guarde en la BD
        onUrlChange(extractedUrl);
        return;
      }
    }
    
    if (isEmbedUrl(trimmed)) {
      setEmbedUrl(trimmed);
      return;
    }
    if (!acceptable) {
      setEmbedUrl(null);
      return;
    }
    setResolving(true);
    fetch("/api/maps-embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmed }),
    })
      .then((r) => r.json())
      .then((data: { embedUrl: string | null }) => {
        setEmbedUrl(data.embedUrl ?? null);
      })
      .catch(() => setEmbedUrl(null))
      .finally(() => {
        setResolving(false);
      });
  }, [trimmed, acceptable]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={mapsUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Ej: https://maps.app.goo.gl/..., URL de compartir de Google Maps o etiqueta iframe completa"
        className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
      />

      {resolving && (
        <div className="flex items-center justify-center rounded-md bg-muted/50 py-8 text-xs text-muted-foreground">
          Cargando vista previa del mapa…
        </div>
      )}

      {!resolving && embedUrl && (
        <div className="w-full">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "0.375rem" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
            allowFullScreen
          />
        </div>
      )}

      {!mapsUrl && !resolving && (
        <div className="flex items-center justify-center rounded-md bg-muted/50 py-8 text-xs text-muted-foreground">
          Ingresa la URL de compartir de Google Maps, URL de embed o etiqueta iframe completa (Compartir → Copiar enlace o Compartir → Incrustar mapa)
        </div>
      )}

      {!resolving && showInvalid && (
        <div className="flex items-center justify-center rounded-md bg-destructive/10 py-8 text-xs text-destructive">
          URL inválida. Usa el enlace de compartir de Google Maps, URL de embed o etiqueta iframe completa (p. ej. maps.app.goo.gl/… o <iframe src="..."></iframe>)
        </div>
      )}
    </div>
  );
}
