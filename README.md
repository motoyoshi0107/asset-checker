# Personal Finance Dashboard 🏦

A modern, full-stack personal finance dashboard built with Next.js and Supabase. Track your assets, expenses, and forecast your financial future.

## Features ✨

- **Asset Tracking** - Record snapshots of your portfolio across different accounts
- **Expense Management** - Log and categorize your spending
- **Interactive Charts** - Visualize portfolio growth and asset allocation
- **Investment Forecasting** - Project future portfolio value with compound interest
- **Dark/Light Mode** - Responsive design with theme switching
- **Secure Authentication** - Row-level security with Supabase Auth

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Charts**: Recharts
- **Deployment**: Vercel + Supabase

## Quick Start 🚀

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd personal-finance-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## Project Structure 📁

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── portfolio-chart.tsx
│   ├── allocation-pie.tsx
│   ├── forecast-slider.tsx
│   └── theme-provider.tsx
├── lib/                   # Utilities and configurations
│   ├── actions/           # Server actions
│   ├── supabase/          # Supabase client
│   ├── types/             # TypeScript types
│   ├── validations/       # Zod schemas
│   └── utils/             # Helper functions
├── sql/                   # Database schema and seeds
│   ├── initial_schema.sql
│   └── seed_data.sql
├── supabase/              # Supabase configuration
│   ├── functions/         # Edge functions
│   └── config.toml
└── scripts/               # Deployment scripts
```

## Database Schema 🗄️

### Tables

- **assets_snapshots** - Portfolio snapshots over time
- **expenses** - Transaction records
- **monthly_settings** - User investment preferences

### Row Level Security

All tables include RLS policies to isolate user data by `user_id`.

## Deployment 🌐

### Quick Deploy

```bash
# Run automated deployment script
./scripts/deploy.sh
```

### Manual Steps

1. **Supabase Setup**
   ```bash
   supabase init
   supabase db push
   supabase functions deploy forecast
   ```

2. **Vercel Deployment**
   ```bash
   vercel --prod
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Environment Variables 🔧

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts 📜

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
```

## Key Components 🧩

### PortfolioChart
Time-series visualization of portfolio growth with multiple asset classes.

### AllocationPie
Current asset allocation breakdown with percentages and tooltips.

### ForecastSlider
Interactive compound interest calculator with adjustable parameters.

## Edge Functions ⚡

### /functions/v1/forecast
Calculates compound interest projections with monthly contributions.

**Request:**
```json
{
  "currentValue": 100000,
  "monthlyInvestment": 1500,
  "annualRate": 0.07,
  "timeHorizonYears": 30
}
```

## Security 🔒

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Input validation with Zod schemas
- Environment variable protection

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Support 💬

- [Documentation](./DEPLOYMENT.md)
- [Issues](https://github.com/your-repo/issues)
- [Discussions](https://github.com/your-repo/discussions)

---

Built with ❤️ using Next.js and Supabase