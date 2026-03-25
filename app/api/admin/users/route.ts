import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return null
  }
  return session
}

// Toggle user isActive
export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, isActive } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, isActive: true },
  })

  return NextResponse.json({ user })
}

// Bulk deactivate by email list
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action, emails } = await req.json()

  if (action === 'bulk-deactivate' && Array.isArray(emails)) {
    const result = await prisma.user.updateMany({
      where: { email: { in: emails } },
      data: { isActive: false },
    })
    return NextResponse.json({ deactivated: result.count })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
