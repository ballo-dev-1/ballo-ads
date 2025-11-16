import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        name,
        email,
        phone,
      },
    })

    return NextResponse.json(
      {
        message: 'Successfully joined the waitlist!',
        data: {
          id: waitlistEntry.id,
          name: waitlistEntry.name,
          email: waitlistEntry.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating waitlist entry:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}

