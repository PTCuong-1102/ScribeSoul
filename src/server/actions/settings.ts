"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema/users"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().max(100, "Tên không được vượt quá 100 ký tự").optional().nullable(),
  image: z.string().url("Hình ảnh phải là URL hợp lệ").max(2048, "URL quá dài").refine(
    (val) => !val || val.startsWith("https://"),
    "Hình ảnh phải sử dụng giao thức HTTPS bảo mật"
  ).optional().nullable().or(z.literal("")),
})

export async function getUserSettings() {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  return user
}

export async function updateProfile(data: { name?: string, image?: string }) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsedData = updateProfileSchema.parse(data)

  await db.update(users)
    .set({
      name: parsedData.name,
      image: parsedData.image || null,
      updatedAt: new Date()
    })
    .where(eq(users.id, session.user.id))

  revalidatePath("/")
  return { success: true }
}

export async function updateAIPreferences(preferences: Record<string, unknown>) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const validatedPreferences = z.record(z.string(), z.unknown()).parse(preferences)

  await db.update(users)
    .set({
      aiPreferences: validatedPreferences,
      updatedAt: new Date()
    })
    .where(eq(users.id, session.user.id))

  revalidatePath("/")
  return { success: true }
}
