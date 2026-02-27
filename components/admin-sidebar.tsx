"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { Building2, Home, LogOut, ClipboardList } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const router = useRouter()
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-52.5 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Building2 className="size-6 text-foreground" />
        <span className="text-base font-bold tracking-tight text-foreground">
          RQB 593
        </span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {/* <button
          onClick={() => onTabChange("dashboard")}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            activeTab === "dashboard"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Home className="size-4" />
          Dashboard
        </button> */}
        <button
          onClick={() => onTabChange("propiedades")}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "propiedades"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ClipboardList className="size-4" />
          Propiedades
        </button>
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <div className="flex size-7.5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            R
          </div>
          <span>Cerrar sesion</span>
          <LogOut className="ml-auto size-4" />
        </button>
      </div>
    </aside>
  )
}
