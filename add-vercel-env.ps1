# Add environment variables to Vercel
$env:VERCEL_ORG_ID = "team_yourorgid"
$env:VERCEL_PROJECT_ID = "prj_yourprojectid"

# Add POSTGRES_URL
Write-Host "Adding POSTGRES_URL..."
$postgresUrl = "postgres://661f93c8d0446522ce28ba1fc90e9ae1f8f155a2161ec0c026a173f163e311be:sk_E54Onsi-S_S5d4EcktCc4@db.prisma.io:5432/postgres?sslmode=require"
echo $postgresUrl | vercel env add POSTGRES_URL production

# Add PRISMA_DATABASE_URL
Write-Host "Adding PRISMA_DATABASE_URL..."
$prismaUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19FNTRPbnNpLVNfUzVkNEVja3RDYzQiLCJhcGlfa2V5IjoiMDFLQldNUjNGVk5TV0c1NTVYVzVTTVBSSkgiLCJ0ZW5hbnRfaWQiOiI2NjFmOTNjOGQwNDQ2NTIyY2UyOGJhMWZjOTBlOWFlMWY4ZjE1NWEyMTYxZWMwYzAyNmExNzNmMTYzZTMxMWJlIiwiaW50ZXJuYWxfc2VjcmV0IjoiOWIxMTI2MTAtN2VmZC00ZjUzLWJlZjktMzExNmVmODM5Yjg1In0.NIrPNo66C3UbRFYIkxJ2NG15O2JrVo8RSrrPwXEJz8Q"
echo $prismaUrl | vercel env add PRISMA_DATABASE_URL production

# Add NEXTAUTH_SECRET
Write-Host "Adding NEXTAUTH_SECRET..."
$nextAuthSecret = "multi-game-super-secret-key-2025-production"
echo $nextAuthSecret | vercel env add NEXTAUTH_SECRET production

# Add NEXTAUTH_URL
Write-Host "Adding NEXTAUTH_URL..."
$nextAuthUrl = "https://multi-game-karthikeyan006867s-projects.vercel.app"
echo $nextAuthUrl | vercel env add NEXTAUTH_URL production

Write-Host "All environment variables added!"
