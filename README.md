# Budget Allocator

> Optimal investment portfolio allocation powered by the **0/1 Knapsack Dynamic Programming** algorithm.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/budget-allocator)

## What it does

Budget Allocator takes your investment budget and a list of investment options, then uses the **0/1 Knapsack DP algorithm** to find the mathematically optimal subset that maximizes total return without exceeding your budget.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Algorithm:** 0/1 Knapsack Dynamic Programming (Deno/TypeScript Edge Function)
- **Charts:** Recharts
- **Hosting:** Vercel

## Quick Start

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the SQL editor
3. Enable Google OAuth in Authentication → Providers → Google

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and anon key.

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy Edge Function

```bash
npx supabase functions deploy optimize-portfolio
```

### 6. Deploy to Vercel

Connect your GitHub repo to Vercel and add the environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Algorithm

```
Maximize:   Σ v_i   for all selected investments i
Subject to: Σ w_i ≤ W   (budget constraint)
            x_i ∈ {0, 1} (each investment chosen at most once)

Time complexity:  O(n × W)
Space complexity: O(n × W) — full table for backtracking and visualization
```

## License

MIT
