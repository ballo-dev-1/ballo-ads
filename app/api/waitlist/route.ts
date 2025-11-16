import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify database connection
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

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
    const existingEntry = await prisma.waitlist.findFirst({
      where: { 
        email: email 
      },
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
    
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: string }
      console.error('Prisma error code:', prismaError.code)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to join waitlist. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}

