import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password, inviteCode } = await req.json()

    if (!email || !password || !inviteCode) {
      return NextResponse.json({ error: 'Email, password, and invite code are required.' }, { status: 400 })
    }

    // Validate invite code
    const invite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.toUpperCase() },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code.' }, { status: 400 })
    }

    if (invite.isUsed) {
      return NextResponse.json({ error: 'This invite code has already been used.' }, { status: 400 })
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite code has expired.' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        isActive: true,
      },
    })

    // Mark invite code as used
    await prisma.inviteCode.update({
      where: { code: inviteCode.toUpperCase() },
      data: { isUsed: true, usedBy: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
