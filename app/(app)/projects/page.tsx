import { cookies } from "next/headers"
import Link from "next/link"
import { createProject } from "./actions"
import { DeleteProjectButton } from "./delete-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009"

interface Project {
  id: string
  name: string
  description: string
  date: string | null
  created_at: string
}

async function fetchProjects(): Promise<Project[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return []
  try {
    const res = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json() as Promise<Project[]>
  } catch {
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await fetchProjects()

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create new project</CardTitle>
          <CardDescription>Add a new project to your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProject} className="flex gap-4 items-center">
            <Input 
              name="name" 
              placeholder="e.g. Wroclaw Flood Alerts" 
              required 
              className="max-w-sm"
              autoComplete="off"
            />
            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {projects.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No projects found. Create one above!</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="relative group">
              <Link href={`/projects/${project.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                  <CardHeader className="py-4 pr-12">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    )}
                    <CardDescription>
                      {project.date
                        ? `Date: ${new Date(project.date).toLocaleDateString()}`
                        : `Created ${new Date(project.created_at).toLocaleDateString()}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <DeleteProjectButton id={project.id} name={project.name} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

