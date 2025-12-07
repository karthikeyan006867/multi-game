# 🎮 Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```powershell
npm install
```

### 2. Set Up Database

The easiest way is to use **Vercel Postgres**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the `DATABASE_URL` connection string
4. Update `.env.local`:

```env
DATABASE_URL="your-postgres-connection-string"
NEXTAUTH_SECRET="run this command: openssl rand -base64 32"
```

### 3. Initialize Database
```powershell
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```powershell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel (2 Minutes)

### Windows PowerShell:
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel login
vercel --prod
```

### In Vercel Dashboard:
1. Add environment variables:
   - `DATABASE_URL` (your Postgres connection)
   - `NEXTAUTH_SECRET` (random secret key)
2. Redeploy if needed

---

## 📝 Default Test Account

```
Email: demo@gaming.com
Password: demo123
```

Or create your own account on first run!

---

## 🎯 Available Games (30+)

All games are accessible from the main dashboard after login.

### Fully Implemented:
1. ✅ **Snake Evolution** - `/games/snake`
2. ✅ **Sudoku Master** - `/games/sudoku`
3. ✅ **Tic Tac Toe Pro** - `/games/tictactoe`

### Template Ready:
Use `components/GameTemplate.tsx` to quickly add more games!

Copy the template and customize:
- Game logic
- Canvas rendering
- Scoring system
- Controls

---

## 🎨 Features Included

✅ User Authentication  
✅ Score Tracking  
✅ Leaderboards  
✅ Coin System  
✅ Level/XP System  
✅ Sound Effects  
✅ Vibration Feedback  
✅ Smooth Animations  
✅ Responsive Design  
✅ Achievement System  
✅ High Score Saving  

---

## 🔧 Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` in `.env.local`
- Run `npx prisma db push` again
- Check your database is accessible

### Build Errors
```powershell
# Clean install
rm -r -force .next, node_modules
npm install
npm run build
```

### Sound Not Playing
- Sounds are optional
- Add MP3 files to `/public/sounds/`
- See `/public/sounds/README.md`

---

## 📚 Adding New Games

1. Copy `components/GameTemplate.tsx`
2. Create new page: `app/games/[your-game]/page.tsx`
3. Add game to `lib/games-data.ts`
4. Customize game logic
5. Test and deploy!

---

## 🌟 What's Next?

- [ ] Add more game implementations
- [ ] Create multiplayer support
- [ ] Add chat system
- [ ] Build tournament brackets
- [ ] Create mobile app version

---

## 💡 Tips

- Games automatically save high scores locally
- Earn coins by playing games
- Level up by gaining experience
- Check leaderboards to compete
- Invite friends for multiplayer games

---

## 📞 Need Help?

Check the full `README.md` for detailed documentation!

Happy Gaming! 🎮
