#!/bin/bash

echo "🎮 Mega Gaming Platform - Deployment Script"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Set environment variables
echo "🔧 Setting environment variables..."
echo ""
echo "Please enter your database URL:"
read DATABASE_URL

echo "Please enter your NextAuth secret (or press Enter to generate):"
read NEXTAUTH_SECRET

if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated secret: $NEXTAUTH_SECRET"
fi

# Create .env.local file
cat > .env.local << EOF
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"
VERCEL_TOKEN="b2cP2dZtUwxbNTK98UDRB5sb"
EOF

echo "✅ Environment variables saved to .env.local"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🗄️  Generating Prisma Client..."
npx prisma generate

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push

echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit your Vercel dashboard to get your production URL"
echo "2. Update NEXTAUTH_URL in Vercel environment variables"
echo "3. Test your application"
echo ""
echo "🎮 Happy Gaming!"
