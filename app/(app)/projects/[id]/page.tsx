import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009"

interface Project {
  id: string
  name: string
  description: string
  date: string | null
  created_at: string
}

async function fetchProject(id: string): Promise<Project | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return null
  try {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json() as Promise<Project>
  } catch {
    return null
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await fetchProject(id)

  if (!project) notFound()

  return (
    <div className="flex flex-col flex-1 h-full gap-6 p-6 overflow-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Projects
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-xs font-mono text-muted-foreground">ID: {project.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Description</span>
              <p className="text-sm">{project.description || <span className="italic text-muted-foreground">No description</span>}</p>
            </div>
            {project.date && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Date</span>
                <p className="text-sm">{new Date(project.date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">Created</span>
              <p className="text-sm">{new Date(project.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
