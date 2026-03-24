"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string
  if (!name || name.trim().length === 0) return

  await prisma.project.create({
    data: { name: name.trim() }
  })

  revalidatePath("/")
  revalidatePath("/projects")
}
