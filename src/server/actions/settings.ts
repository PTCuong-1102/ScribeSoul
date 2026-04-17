"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema/users"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getUserSettings() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  return user
}

export async function updateProfile(data: { name?: string, image?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(users)
    .set({
      name: data.name,
      image: data.image,
      updatedAt: new Date()
    })
    .where(eq(users.id, session.user.id))

  revalidatePath("/")
  return { success: true }
}

export async function updateAIPreferences(preferences: Record<string, unknown>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // In a real app, you might have a dedicated settings table or a JSONB column on users
  // For this MVP, we'll just log it or update a generic settings field if it exists
  console.log("Updating AI preferences:", preferences)
  
  // Example update (adjust based on actual schema)
  /*
  await db.update(users)
    .set({ metadata: { ...(user.metadata), aiPreferences: preferences } })
    .where(eq(users.id, session.user.id))
  */

  return { success: true }
}
