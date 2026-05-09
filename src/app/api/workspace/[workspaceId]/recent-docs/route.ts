export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema/documents"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { data: session } = await auth.getSession()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { workspaceId } = await params

    // Verify workspace ownership
    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)),
    })
    if (!workspace) return new NextResponse("Forbidden", { status: 403 })

    const recentDocs = await db.query.documents.findMany({
      where: eq(documents.workspaceId, workspaceId),
      orderBy: [desc(documents.updatedAt)],
      limit: 5,
      columns: {
        id: true,
        title: true,
      }
    })

    return NextResponse.json(recentDocs)
  } catch (error) {
    console.error("[RECENT_DOCS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
