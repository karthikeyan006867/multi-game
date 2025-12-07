import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@gaming.com' },
    update: {},
    create: {
      email: 'demo@gaming.com',
      username: 'DemoPlayer',
      password: hashedPassword,
      coins: 5000,
      level: 5,
      experience: 4500,
    },
  });

  console.log('✅ Demo user created:', demoUser.username);

  // Create some sample achievements
  const achievements = [
    {
      name: 'First Win',
      description: 'Win your first game',
      icon: '🏆',
      points: 10,
      requirement: 'win_1_game',
    },
    {
      name: 'Snake Master',
      description: 'Score 500 in Snake',
      icon: '🐍',
      gameId: 'snake',
      points: 50,
      requirement: 'snake_score_500',
    },
    {
      name: 'Sudoku Expert',
      description: 'Complete a hard Sudoku',
      icon: '🧩',
      gameId: 'sudoku',
      points: 100,
      requirement: 'sudoku_hard_complete',
    },
    {
      name: 'Tic Tac Toe Champion',
      description: 'Beat AI on hard mode',
      icon: '❌',
      gameId: 'tictactoe',
      points: 30,
      requirement: 'tictactoe_hard_win',
    },
    {
      name: 'Coin Collector',
      description: 'Collect 10000 coins',
      icon: '💰',
      points: 200,
      requirement: 'coins_10000',
    },
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name },
    });
    
    if (!existing) {
      await prisma.achievement.create({
        data: achievement,
      });
    }
  }

  console.log('✅ Achievements created');

  // Create sample scores
  const sampleScores = [
    { gameId: 'snake', score: 450, level: 5 },
    { gameId: 'sudoku', score: 1000, level: 1 },
    { gameId: 'tictactoe', score: 30, level: 1 },
  ];

  for (const scoreData of sampleScores) {
    await prisma.score.create({
      data: {
        userId: demoUser.id,
        ...scoreData,
      },
    });
  }

  console.log('✅ Sample scores created');
  console.log('\n🎮 Database seeded successfully!');
  console.log('\n📝 Demo Account:');
  console.log('   Email: demo@gaming.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
