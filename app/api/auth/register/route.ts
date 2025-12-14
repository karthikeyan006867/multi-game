import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      );
    }

    // Mock user for development
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email: email,
      username: username,
      avatar: null,
      coins: 1000,
      level: 1,
      experience: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ user: mockUser });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
