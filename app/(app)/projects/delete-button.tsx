"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteProject } from "./actions"

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        if (!confirm(`Delete "${name}"?`)) return
        await deleteProject(id)
      }}
      className="absolute top-3 right-3"
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}
