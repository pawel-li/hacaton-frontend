import { prisma } from "@/lib/prisma"
import { createProject } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  })

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
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription>
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

