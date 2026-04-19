import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { workspaces } from '@/lib/db/schema/workspaces'
import { users } from '@/lib/db/schema/users'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export default async function WorkspaceIndex() {
  const { data: session } = await auth.getSession()
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    [dbUser] = await db.insert(users).values({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
    }).returning();
  }

  const defaultWorkspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerId, dbUser.id),
  })

  if (defaultWorkspace) {
    redirect(`/workspace/${defaultWorkspace.id}`)
  }

  const [newWorkspace] = await db.insert(workspaces).values({
    ownerId: dbUser.id,
    name: 'Thư viện của tôi',
  }).returning()

  redirect(`/workspace/${newWorkspace.id}`)
}
