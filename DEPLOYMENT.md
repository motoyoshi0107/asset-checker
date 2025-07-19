# Personal Finance Dashboard - Deployment Guide

## Prerequisites

Install required CLI tools:

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Install Vercel CLI
npm install -g vercel

# Verify installations
supabase --version
vercel --version
```

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

```bash
# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your Supabase project (create one at https://supabase.com if needed)
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.2 Database Migration

```bash
# Push database schema
supabase db push

# Seed database with demo data
supabase db reset --debug
```

### 1.3 Deploy Edge Functions

```bash
# Deploy forecast function
supabase functions deploy forecast

# Verify deployment
supabase functions list
```

### 1.4 Environment Variables

Create `.env.local` file:

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your Supabase credentials
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
```

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 2: Local Development

```bash
# Install dependencies
npm install

# Start Supabase locally (optional)
supabase start

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## Step 3: Production Deployment

### 3.1 Build & Test

```bash
# Build project
npm run build

# Type check
npm run typecheck

# Lint code
npm run lint

# Test locally
npm start
```

### 3.2 Vercel Deployment

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3.3 Domain Configuration (Optional)

```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS records as instructed
```

## Step 4: Verification

### 4.1 Database Check

```bash
# Connect to production database
supabase db connect

# Run test queries
SELECT COUNT(*) FROM assets_snapshots;
SELECT COUNT(*) FROM expenses;
SELECT COUNT(*) FROM monthly_settings;
```

### 4.2 Function Testing

```bash
# Test edge function
curl -X POST https://your-project.supabase.co/functions/v1/forecast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "currentValue": 100000,
    "monthlyInvestment": 1500,
    "annualRate": 0.07,
    "timeHorizonYears": 30
  }'
```

### 4.3 Frontend Testing

Visit your deployment URL and verify:
- [ ] Dashboard loads with sample data
- [ ] Portfolio chart displays correctly
- [ ] Allocation pie chart shows data
- [ ] Forecast slider is interactive
- [ ] Theme toggle works
- [ ] Responsive on mobile

## Step 5: Post-Deployment

### 5.1 Monitoring

```bash
# View Supabase logs
supabase functions logs forecast

# View Vercel deployment logs
vercel logs
```

### 5.2 Analytics (Optional)

```bash
# Enable Supabase analytics
supabase analytics enable

# View metrics
supabase analytics stats
```

## Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check connection
supabase status

# Reset local database
supabase db reset
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

**Edge Function Errors:**
```bash
# Check function logs
supabase functions logs forecast --follow

# Redeploy function
supabase functions deploy forecast --verify-jwt false
```

**Environment Variable Issues:**
```bash
# Verify environment variables
vercel env ls

# Update production environment
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

### Performance Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images (if using next/image)
npm install sharp

# Enable compression
# Add to next.config.js:
# compress: true
```

## Security Checklist

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Supabase anon key properly configured
- [ ] Environment variables secured
- [ ] CORS properly configured for edge functions
- [ ] Database backup strategy in place

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Update Supabase CLI
npm install -g @supabase/cli@latest

# Update Vercel CLI
npm install -g vercel@latest
```

### Database Maintenance

```bash
# Create database backup
supabase db dump > backup.sql

# View database size
supabase db inspect

# Analyze performance
supabase db analyze
```

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Issues:** Create issue in project repository