# 🎮 Mega Gaming Platform

A comprehensive gaming platform featuring **30+ advanced games** with animations, sound effects, vibration feedback, and social features.

## ✨ Features

### 🎯 30+ Games Including:
- **Puzzle Games**: Sudoku, 2048, Match-3, Crossword
- **Strategy Games**: Tic Tac Toe, Chess, Checkers, Connect 4
- **Action Games**: Snake, Pac-Man, Space Invaders, Flappy Bird
- **Runner Games**: Temple Run, Subway Surfers
- **Fighting**: Shadow Fight
- **Sports**: Hand Cricket, Baseball, Football, Basketball
- **Card & Board**: Poker, Blackjack, Ludo, Monopoly
- **Arcade**: Breakout, Tetris, Minesweeper, Tower Defense
- **Racing**: Car Racing, Bike Racing

### 🚀 Platform Features:
- ✅ User Authentication & Profiles
- ✅ Real-time Leaderboards
- ✅ Achievement System
- ✅ Coin Economy & Rewards
- ✅ Level & XP System
- ✅ Sound Effects & Background Music
- ✅ Haptic/Vibration Feedback
- ✅ Smooth Animations (Framer Motion)
- ✅ Responsive Design
- ✅ PostgreSQL Database
- ✅ Tournament System
- ✅ Friends System
- ✅ Score Tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Audio**: Howler.js
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel
- **State Management**: Zustand
- **UI Enhancements**: React Hot Toast, Canvas Confetti

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

Create a PostgreSQL database on Vercel or any provider. Update `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
VERCEL_TOKEN="b2cP2dZtUwxbNTK98UDRB5sb"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI (Automated)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Set environment variables
4. Deploy

### Environment Variables (Vercel Dashboard):

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret key for authentication
- `NEXTAUTH_URL`: Your production URL

## 🎮 Game Controls

### Snake Evolution
- **Arrow Keys**: Move snake
- **Spacebar**: Pause/Resume
- **Features**: Power-ups, obstacles, progressive difficulty

### Sudoku Master
- **Mouse Click**: Select cell
- **Number Keys/Buttons**: Fill numbers
- **Features**: 3 difficulty levels, hints, error checking

### Tic Tac Toe Pro
- **Mouse Click**: Place mark
- **Features**: AI opponent, multiplayer, difficulty levels

### Temple Run / Subway Surfers
- **Arrow Keys / Swipe**: Change lanes, jump, slide
- **Features**: Endless running, collectibles, power-ups

### Shadow Fight
- **Arrow Keys**: Move
- **Z/X/C**: Attack, special moves, block
- **Features**: Combo system, multiple characters

## 📊 Database Schema

### User
- Profile information
- Coins, level, experience
- Authentication credentials

### Score
- Game scores with timestamps
- Linked to users and games
- Leaderboard rankings

### Achievement
- Unlockable achievements
- Points and requirements
- User progress tracking

### Tournament
- Competitive events
- Prize pools
- Participant rankings

## 🎨 Customization

### Adding New Games

1. Create game component in `app/games/[game-name]/page.tsx`
2. Add game data to `lib/games-data.ts`
3. Implement game logic with canvas/HTML
4. Integrate sound, vibration, and scoring

### Modifying Themes

Edit `tailwind.config.ts` for color schemes and animations.

## 📱 Features In Detail

### Sound System
- Background music with volume control
- SFX for actions, wins, losses
- Mute/unmute functionality

### Vibration Feedback
- Light: UI interactions
- Medium: Power-ups, achievements
- Heavy: Game over, major events
- Pattern-based for combos

### Achievement System
- 50+ achievements across all games
- Progress tracking
- Reward distribution

### Social Features
- Friend system
- Global & friend leaderboards
- Real-time rankings
- Tournament competitions

## 🔧 Scripts

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Database
npx prisma studio        # Database GUI
npx prisma db push       # Push schema
npx prisma generate      # Generate client

# Deploy
vercel --prod
```

## 🎯 Game Progress & Rewards

- **XP System**: Gain experience from playing
- **Level Up**: Unlock features and bonuses
- **Coins**: Earned through gameplay
- **Daily Challenges**: Extra rewards
- **Tournaments**: Compete for prizes

## 🐛 Troubleshooting

### Database Connection Issues
1. Verify DATABASE_URL in `.env.local`
2. Run `npx prisma db push`
3. Check database provider status

### Sound Not Playing
1. Check browser autoplay policies
2. Ensure sound files are in `/public/sounds/`
3. Verify Howler.js installation

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 🙏 Credits

- Games inspired by classic arcade and mobile games
- UI/UX design with modern web technologies
- Community feedback and testing

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check documentation
- Contact support

---

**Built with ❤️ for gamers by gamers**

🎮 Happy Gaming! 🎮
