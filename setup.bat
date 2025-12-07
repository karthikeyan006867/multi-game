@echo off
echo ====================================
echo 🎮 Gaming Platform - Quick Setup
echo ====================================
echo.

echo [1/5] Installing dependencies...
call npm install

echo.
echo [2/5] Generating Prisma Client...
call npx prisma generate

echo.
echo [3/5] Creating database...
call npx prisma db push --accept-data-loss

echo.
echo [4/5] Seeding database with demo data...
call npm run db:seed

echo.
echo [5/5] Setup complete! 🎉
echo.
echo ====================================
echo 📝 Demo Account:
echo    Email: demo@gaming.com
echo    Password: demo123
echo ====================================
echo.
echo 🚀 Start the server with: npm run dev
echo 🌐 Then visit: http://localhost:3000
echo.
pause
