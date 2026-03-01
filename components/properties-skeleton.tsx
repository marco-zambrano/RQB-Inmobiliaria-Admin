interface PropertiesSkeletonProps {
  isMobile?: boolean
}

export function PropertiesSkeleton({ isMobile = false }: PropertiesSkeletonProps) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-3">
            <div className="flex gap-3">
              <div className="h-16 w-20 rounded-md bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-border pt-2">
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Imagen
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Título
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Precio
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Provincia
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Estado
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Nivel de Interés
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-t border-border">
                <td className="p-4">
                  <div className="h-12 w-16 rounded-md bg-muted animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
