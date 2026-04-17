"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema/users"
import { eq } from "drizzle-orm"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  return user || null
}
