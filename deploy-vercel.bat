@echo off
echo ========================================
echo   DEPLOYING TO VERCEL
echo ========================================
echo.

echo Step 1: Building locally first...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed locally. Please fix errors first.
    exit /b 1
)

echo.
echo Step 2: Deploying to Vercel...
call vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/karthikeyan006867s-projects/multi-game
echo 2. Add environment variables:
echo    - DATABASE_URL
echo    - POSTGRES_URL
echo    - PRISMA_DATABASE_URL
echo    - NEXTAUTH_SECRET
echo    - NEXTAUTH_URL
echo 3. Redeploy from Vercel dashboard
echo.
pause
