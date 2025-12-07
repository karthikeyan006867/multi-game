import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, gameId, score, level, time } = await request.json();

    const newScore = await prisma.score.create({
      data: {
        userId,
        gameId,
        score,
        level: level || 1,
        time,
      },
    });

    // Update user experience and coins
    const coinsEarned = Math.floor(score / 10);
    const expEarned = Math.floor(score / 5);

    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: coinsEarned },
        experience: { increment: expEarned },
      },
    });

    return NextResponse.json({ success: true, coinsEarned, expEarned, newScore });
  } catch (error) {
    console.error('Score save error:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const scores = await prisma.score.findMany({
      where: gameId ? { gameId } : undefined,
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            level: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
