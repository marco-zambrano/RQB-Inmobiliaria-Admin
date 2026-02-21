"use client";

interface MapPreviewProps {
  mapsUrl?: string;
  onUrlChange: (url: string) => void;
}

export function MapPreview({ mapsUrl = "", onUrlChange }: MapPreviewProps) {
  // Validar si la URL es válida para embed
  const isValidMapsUrl = mapsUrl && (
    mapsUrl.includes("google.com/maps") || 
    mapsUrl.includes("gstatic.com")
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={mapsUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Ej: https://www.google.com/maps/embed?pb=... o enlace de Google Maps"
        className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
      />

      {isValidMapsUrl && (
        <div className="w-full">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "0.375rem" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapsUrl}
            allowFullScreen
          ></iframe>
        </div>
      )}

      {!mapsUrl && (
        <div className="flex items-center justify-center rounded-md bg-muted/50 py-8 text-xs text-muted-foreground">
          Ingresa una URL de Google Maps para ver la vista previa
        </div>
      )}

      {mapsUrl && !isValidMapsUrl && (
        <div className="flex items-center justify-center rounded-md bg-destructive/10 py-8 text-xs text-destructive">
          URL inválida. Copia el código embed de Google Maps
        </div>
      )}
    </div>
  );
}
