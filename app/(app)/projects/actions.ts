"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009"

export async function deleteProject(projectId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return

  await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  revalidatePath("/projects")
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string
  if (!name || name.trim().length === 0) return

  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return

  await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: name.trim() }),
  })

  revalidatePath("/")
  revalidatePath("/projects")
}
