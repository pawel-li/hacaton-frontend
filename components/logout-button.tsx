"use client"

import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { user, logout } = useAuth()
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
      <span className="truncate text-muted-foreground">{user?.email}</span>
      <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
