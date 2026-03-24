import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!project) return notFound()

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
      <p className="text-muted-foreground">
        Created on {new Date(project.createdAt).toLocaleDateString()}
      </p>
      
      <div className="bg-muted/50 p-6 rounded-xl border mt-4">
        <p className="text-center text-muted-foreground">Workspace and workflows for this project will appear here.</p>
      </div>
    </div>
  )
}
