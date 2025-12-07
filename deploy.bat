@echo off
echo 🎮 Mega Gaming Platform - Deployment Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Install Vercel CLI
echo 📦 Installing Vercel CLI...
call npm install -g vercel

REM Install project dependencies
echo 📦 Installing project dependencies...
call npm install

REM Generate Prisma Client
echo 🗄️  Generating Prisma Client...
call npx prisma generate

echo.
echo 🔧 Environment Setup
echo ====================
echo.
echo Please follow these steps:
echo 1. Create a PostgreSQL database (e.g., on Vercel Postgres)
echo 2. Copy your DATABASE_URL
echo 3. Update .env.local file with your credentials
echo.

REM Push database schema
echo 📊 Initializing database...
call npx prisma db push

echo.
echo 🚀 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 📝 Next steps:
echo 1. Visit your Vercel dashboard to configure environment variables
echo 2. Add DATABASE_URL to Vercel environment variables
echo 3. Add NEXTAUTH_SECRET to Vercel environment variables
echo 4. Test your application
echo.
echo 🎮 Happy Gaming!
pause
