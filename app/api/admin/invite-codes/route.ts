import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return null
  }
  return session
}

function generateCode(): string {
  return 'MIDAS-' + randomBytes(3).toString('hex').toUpperCase()
}

// Create a new invite code
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { days } = await req.json()

  let expiresAt: Date | null = null
  if (days && days > 0) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)
  }

  // Ensure unique code
  let code: string
  let attempts = 0
  do {
    code = generateCode()
    attempts++
    const existing = await prisma.inviteCode.findUnique({ where: { code } })
    if (!existing) break
  } while (attempts < 10)

  const inviteCode = await prisma.inviteCode.create({
    data: { code, expiresAt },
  })

  return NextResponse.json({ inviteCode })
}

// Delete/deactivate an invite code
export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.inviteCode.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
