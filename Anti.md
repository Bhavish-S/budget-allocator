# BUDGET ALLOCATOR — Complete Lovable.dev Build Prompt
# Copy everything below this line into Lovable's prompt box

---

## PROJECT OVERVIEW

Build a complete, production-ready, full-stack SaaS web application called **Budget Allocator** — a financial portfolio optimization tool that uses the **0/1 Knapsack Dynamic Programming algorithm** to help users allocate their investment budget optimally across multiple investment options.

This is a **real product** — not a demo. It must be polished, fully functional, ready to deploy on Vercel, and use Supabase as the backend. Every feature described here must work end-to-end with no placeholder data, no broken flows, and no dummy functions.

---

## TECH STACK (DO NOT DEVIATE)

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + shadcn/ui components
- **State Management:** TanStack React Query v5
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Database:** PostgreSQL via Supabase (with Row-Level Security enabled on ALL tables)
- **Backend Logic:** Supabase Edge Functions (Deno/TypeScript) — the DP algorithm runs server-side here
- **Charts:** Recharts
- **Hosting:** Vercel (configure vercel.json)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Notifications:** Sonner (toast library)
- **HTTP Client:** TanStack Query + native fetch (no axios)

---

## DESIGN SYSTEM

Apply this exact design system throughout every page. No generic blue/white defaults.

### Color Palette
```
--color-navy:       #0A1628   (primary backgrounds, navbar)
--color-slate:      #1B3A6B   (cards, secondary surfaces)
--color-gold:       #C9A84C   (primary CTAs, accents, highlights)
--color-gold-light: #E8D5A3   (gold tints, subtext on dark)
--color-blue:       #2D5EA8   (secondary buttons, links)
--color-gray-50:    #F5F7FA   (light card backgrounds)
--color-gray-400:   #8A9BB5   (muted text, captions)
--color-success:    #16A34A   (positive ROI, success states)
--color-warning:    #D97706   (medium risk, warnings)
--color-danger:     #DC2626   (high risk, errors)
--color-text:       #1A2332   (primary text on light backgrounds)
```

### Typography
```
Font family (body/UI): 'Inter', sans-serif  → import from Google Fonts
Font family (code/data): 'JetBrains Mono', monospace  → import from Google Fonts
```

### Design Rules
- Navbar: navy background (#0A1628), gold logo text, white nav links
- Page backgrounds: either navy (#0A1628) for full-dark sections OR #F5F7FA for light content areas
- Cards on dark bg: #1B3A6B with 1px border rgba(201,168,76,0.2)
- Cards on light bg: white with 1px border #E2E8F0 and subtle shadow
- Primary button: gold (#C9A84C) background, navy text, font-weight 600
- Secondary button: transparent with gold border and gold text
- Border radius: 8px for cards, 6px for buttons/inputs, 4px for tags
- NO generic blue (#3B82F6), NO plain white headers, NO card-heavy cluttered layouts
- Spacing: generous — 24px minimum between sections, 16px inside cards

### Signature Element
The **live DP table heatmap** on the Optimizer page: when the user clicks Optimize, display an animated 2D grid that fills cell by cell (left-to-right, top-to-bottom) with a color scale from navy → gold based on the dp[i][j] value. This must actually render and animate — it is the core feature.

---

## SUPABASE CONFIGURATION

### Environment Variables Required
```
VITE_SUPABASE_URL=<user will provide>
VITE_SUPABASE_ANON_KEY=<user will provide>
```

Create a `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Database Schema (run these as SQL migrations in Supabase)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Portfolios
create table public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  budget numeric(15,2) not null check (budget > 0),
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Investment categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  color text not null,
  icon text not null
);

-- Pre-populate categories
insert into public.categories (name, color, icon) values
  ('Stocks', '#2D5EA8', 'trending-up'),
  ('Bonds', '#16A34A', 'shield'),
  ('Mutual Funds', '#C9A84C', 'pie-chart'),
  ('Fixed Deposit', '#8A9BB5', 'lock'),
  ('Real Estate', '#D97706', 'home'),
  ('Cryptocurrency', '#DC2626', 'zap'),
  ('ETF', '#1B3A6B', 'layers'),
  ('Gold', '#C9A84C', 'gem');

-- Investments
create table public.investments (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  cost numeric(15,2) not null check (cost > 0),
  expected_return numeric(15,2) not null check (expected_return >= 0),
  category_id uuid references public.categories(id),
  risk_level integer check (risk_level between 1 and 5) default 3,
  created_at timestamptz default now()
);

-- Optimization runs
create table public.optimization_runs (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  total_budget numeric(15,2) not null,
  total_cost numeric(15,2) not null,
  total_return numeric(15,2) not null,
  roi_percent numeric(8,4) not null,
  selected_investment_ids uuid[] not null,
  dp_table_snapshot jsonb,
  greedy_result_json jsonb,
  algorithm_variant text default '0/1-dp',
  execution_time_ms integer,
  run_at timestamptz default now()
);

-- Shared portfolios
create table public.shared_portfolios (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.investments enable row level security;
alter table public.optimization_runs enable row level security;
alter table public.shared_portfolios enable row level security;

-- RLS Policies
create policy "Users own their profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users own their portfolios" on public.portfolios
  for all using (auth.uid() = user_id);

create policy "Users own their investments" on public.investments
  for all using (auth.uid() = user_id);

create policy "Users own their runs" on public.optimization_runs
  for all using (auth.uid() = user_id);

create policy "Users manage their shares" on public.shared_portfolios
  for all using (auth.uid() = user_id);

create policy "Public can view shared portfolios" on public.portfolios
  for select using (
    exists (
      select 1 from public.shared_portfolios sp
      where sp.portfolio_id = id
      and (sp.expires_at is null or sp.expires_at > now())
    )
  );

create policy "Categories are public" on public.categories
  for select using (true);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Edge Function: Knapsack Optimizer

Create `supabase/functions/optimize-portfolio/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Investment {
  id: string
  name: string
  cost: number
  expected_return: number
  category: string
  risk_level: number
}

interface OptimizationRequest {
  portfolio_id: string
  budget: number
  investments: Investment[]
  unit_size?: number
}

function knapsack01DP(investments: Investment[], budget: number, unitSize: number) {
  const n = investments.length
  const W = Math.floor(budget / unitSize)
  
  // Space-optimized 1D DP
  const dp = new Array(W + 1).fill(0)
  const scaledCosts = investments.map(inv => Math.floor(inv.cost / unitSize))
  const scaledReturns = investments.map(inv => Math.floor(inv.expected_return * 100)) // cents
  
  // Track which items were selected (2D boolean table for backtracking)
  const selected = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false))
  const dpFull = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  
  for (let i = 1; i <= n; i++) {
    for (let j = W; j >= 0; j--) {
      dpFull[i][j] = dpFull[i-1][j]
      if (scaledCosts[i-1] <= j) {
        const withItem = dpFull[i-1][j - scaledCosts[i-1]] + scaledReturns[i-1]
        if (withItem > dpFull[i][j]) {
          dpFull[i][j] = withItem
          selected[i][j] = true
        }
      }
    }
  }
  
  // Backtrack to find selected investments
  const selectedIds: string[] = []
  let j = W
  for (let i = n; i >= 1; i--) {
    if (selected[i][j]) {
      selectedIds.push(investments[i-1].id)
      j -= scaledCosts[i-1]
    }
  }
  
  const optimalReturn = dpFull[n][W] / 100
  const totalCost = selectedIds.reduce((sum, id) => {
    const inv = investments.find(i => i.id === id)!
    return sum + inv.cost
  }, 0)
  
  // Snapshot of DP table (sample for visualization, cap at 50x50)
  const snapN = Math.min(n, 50)
  const snapW = Math.min(W, 50)
  const snapshot = dpFull.slice(0, snapN+1).map(row => row.slice(0, snapW+1))
  
  return { selectedIds, optimalReturn, totalCost, snapshot, dpFullMax: dpFull[n][W] / 100 }
}

function greedyByROI(investments: Investment[], budget: number) {
  const sorted = [...investments].sort((a, b) => 
    (b.expected_return / b.cost) - (a.expected_return / a.cost)
  )
  let remaining = budget
  const selectedIds: string[] = []
  let totalReturn = 0, totalCost = 0
  
  for (const inv of sorted) {
    if (inv.cost <= remaining) {
      selectedIds.push(inv.id)
      remaining -= inv.cost
      totalReturn += inv.expected_return
      totalCost += inv.cost
    }
  }
  return { selectedIds, totalReturn, totalCost }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const start = Date.now()
    const { portfolio_id, budget, investments, unit_size = 1000 }: OptimizationRequest = await req.json()
    
    if (!investments || investments.length === 0) {
      return new Response(JSON.stringify({ error: 'No investments provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (investments.length > 500) {
      return new Response(JSON.stringify({ error: 'Maximum 500 investments per run' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const dpResult = knapsack01DP(investments, budget, unit_size)
    const greedyResult = greedyByROI(investments, budget)
    const executionTime = Date.now() - start
    
    const roiPercent = dpResult.totalCost > 0
      ? ((dpResult.optimalReturn - dpResult.totalCost) / dpResult.totalCost) * 100
      : 0
    
    // Save to Supabase
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    const { data: run, error: runError } = await supabase
      .from('optimization_runs')
      .insert({
        portfolio_id,
        user_id: user!.id,
        total_budget: budget,
        total_cost: dpResult.totalCost,
        total_return: dpResult.optimalReturn,
        roi_percent: roiPercent,
        selected_investment_ids: dpResult.selectedIds,
        dp_table_snapshot: dpResult.snapshot,
        greedy_result_json: greedyResult,
        algorithm_variant: '0/1-dp',
        execution_time_ms: executionTime,
      })
      .select()
      .single()
    
    if (runError) console.error('DB error:', runError)
    
    return new Response(JSON.stringify({
      success: true,
      run_id: run?.id,
      dp_result: {
        selected_ids: dpResult.selectedIds,
        total_cost: dpResult.totalCost,
        total_return: dpResult.optimalReturn,
        roi_percent: roiPercent,
        budget_utilized_percent: (dpResult.totalCost / budget) * 100,
      },
      greedy_result: greedyResult,
      dp_snapshot: dpResult.snapshot,
      execution_time_ms: executionTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

---

## FILE STRUCTURE

```
budget-allocator/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                          ← shadcn components (auto-generated)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── portfolio/
│   │   │   ├── PortfolioCard.tsx
│   │   │   ├── PortfolioForm.tsx
│   │   │   └── PortfolioList.tsx
│   │   ├── investment/
│   │   │   ├── InvestmentRow.tsx
│   │   │   ├── InvestmentForm.tsx
│   │   │   ├── InvestmentTable.tsx
│   │   │   └── CSVImport.tsx
│   │   ├── optimizer/
│   │   │   ├── OptimizeButton.tsx
│   │   │   ├── ResultPanel.tsx
│   │   │   ├── DPHeatmap.tsx            ← animated DP table
│   │   │   ├── ComparisonPanel.tsx
│   │   │   └── SensitivitySlider.tsx
│   │   ├── charts/
│   │   │   ├── AllocationPieChart.tsx
│   │   │   ├── ReturnBarChart.tsx
│   │   │   └── ROITrendChart.tsx
│   │   └── shared/
│   │       ├── StatCard.tsx
│   │       ├── RiskBadge.tsx
│   │       ├── CurrencyDisplay.tsx
│   │       └── EmptyState.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── app/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Portfolios.tsx
│   │   │   ├── PortfolioDetail.tsx
│   │   │   ├── Optimizer.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   └── public/
│   │       └── SharedPortfolio.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePortfolios.ts
│   │   ├── useInvestments.ts
│   │   ├── useOptimizer.ts
│   │   └── useCategories.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── database.types.ts
│   │   ├── knapsack.ts                  ← client-side DP (for demo mode)
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── functions/
│       └── optimize-portfolio/
│           └── index.ts
├── vercel.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## PAGE-BY-PAGE REQUIREMENTS

### 1. LANDING PAGE (`/`)

**Hero Section:**
- Full-width navy (#0A1628) background with subtle diagonal geometric pattern (CSS only, no images)
- Large heading: "Optimize Your Investments" (Inter, 56px, font-weight 800, white)
- Subheading: "The 0/1 Knapsack algorithm finds your exact optimal portfolio allocation. No guessing. No heuristics. Mathematical certainty." (gold-light color)
- Two CTAs: "Start Optimizing — Free" (gold button) and "See Live Demo" (ghost button with gold border)
- Animated counter cards showing: "₹2.4Cr Optimized", "12,400+ Portfolios", "99.9% Accuracy"

**How It Works Section (3 steps):**
1. Set your budget and add investments
2. Click Optimize — our DP algorithm runs in milliseconds
3. Get your exact optimal allocation with full explanation

**Features Grid (6 cards on light bg):**
- Exact Optimization (0/1 DP, not approximations)
- Visual DP Table (see the algorithm think)
- Multi-Portfolio Management
- Greedy Comparison (see how much better DP is)
- CSV Import & Export
- Shareable Reports

**Demo Section:**
- Embedded live optimizer widget (no login) with 5 preset investments and budget of ₹10,00,000
- Shows the result and a mini DP table heatmap
- CTA: "Want your own portfolios? Sign up free"

**Pricing Section (3 tiers):**
- Free: 3 portfolios, 20 investments each, 10 optimizations/month
- Pro (₹499/mo): Unlimited portfolios, 200 investments, unlimited optimizations, CSV export, share links
- Team (₹1999/mo): Everything in Pro + team collaboration, API access, priority support
- (Pricing UI only — no actual payment integration needed)

**Footer:** Logo, links (Features, Pricing, Docs, GitHub), social icons, copyright

---

### 2. AUTH PAGES (`/login`, `/signup`)

- Split layout: left side navy with product value prop, right side white with form
- Signup: Full Name, Email, Password (min 8 chars), Confirm Password
- Login: Email, Password, "Forgot password?" link
- Google OAuth button (wired to Supabase)
- Redirect to `/app/dashboard` on success
- Show appropriate error messages from Supabase (wrong password, email taken, etc.)

---

### 3. APP LAYOUT (authenticated pages)

- Top navbar: navy bg, "Budget Allocator" logo (gold), user avatar dropdown (profile, settings, logout)
- Left sidebar (240px): links to Dashboard, Portfolios, Analytics, History, Settings; collapsible on mobile
- Main content area: light gray (#F5F7FA) background
- Responsive: sidebar becomes bottom tab bar on mobile

---

### 4. DASHBOARD (`/app/dashboard`)

**Stat Cards (4 in a row):**
- Total Portfolios (with portfolio icon)
- Total Budget Across All Portfolios (formatted currency)
- Best ROI Achieved (% with up arrow)
- Optimization Runs This Month

**Recent Portfolios (last 5):**
- Each card shows: portfolio name, budget, investment count, last optimized date, best ROI %
- Quick "Optimize" button on each card

**Quick Actions:**
- "Create New Portfolio" button (opens modal)
- "Import CSV" button

**Recent Optimization Runs (table, last 10):**
- Columns: Portfolio Name, Date, Budget, Optimal Return, ROI%, Execution Time
- Click row to see full results

---

### 5. PORTFOLIOS PAGE (`/app/portfolios`)

- Grid of portfolio cards (3 per row on desktop, 1 on mobile)
- Each card: name, description, budget (large), currency, investment count, "Optimize" and "View" buttons, three-dot menu (Edit, Delete, Share)
- "New Portfolio" FAB button (bottom right, gold)
- Portfolio create/edit: slide-out drawer with form fields (name, description, budget, currency dropdown: INR/USD/EUR/GBP)
- Delete confirmation modal

---

### 6. PORTFOLIO DETAIL PAGE (`/app/portfolios/:id`)

**Header:** Portfolio name, budget, description, Edit/Delete/Share/Optimize buttons

**Investments Table:**
- Columns: Name, Category (colored badge), Cost, Expected Return, ROI%, Risk Level (1-5 stars), Actions (edit/delete)
- Add Investment button (opens slide-out form)
- Investment form fields: Name, Description, Cost (₹), Expected Return (₹), Category (dropdown), Risk Level (1-5 slider)
- "Import CSV" button — accepts CSV with columns: name, cost, expected_return, category, risk_level
- CSV template download link

**Portfolio Summary Cards:**
- Total investment cost (if all selected)
- Budget utilization %
- Average expected ROI
- Highest ROI investment

---

### 7. OPTIMIZER PAGE (`/app/portfolios/:id/optimize`)

This is the CORE page. Every element must work perfectly.

**Left Panel — Investment List:**
- All investments listed with checkboxes (all checked by default)
- User can uncheck to exclude investments from optimization
- Shows cost and expected return for each

**Center Panel — Optimizer Controls:**
- Budget input (pre-filled from portfolio, editable for "what-if" scenarios)
- Unit Size selector (₹1000, ₹5000, ₹10000, ₹50000) — affects DP granularity
- Algorithm selector: "0/1 Knapsack DP" (default), "Space-Optimized DP", "Greedy (ROI%)"
- Large gold "OPTIMIZE NOW" button
- While optimizing: show spinner with text "Computing optimal allocation..."

**Right Panel — Results (appears after optimization):**
- Selected investments list with total cost and return
- Large ROI % number (green, JetBrains Mono font, 48px)
- Budget utilized: X% (progress bar, gold fill)
- Unspent budget: ₹X

**Bottom Section — DP Table Heatmap:**
- Title: "Dynamic Programming Table — The Algorithm's Work"
- Animated grid (rows = investments, columns = budget units, capped at 50x50 for display)
- Color scale: 0 value → navy, max value → gold
- Animation: cells fill in row by row with 2ms delay per cell (requestAnimationFrame)
- Axis labels: Y = investment names (truncated), X = budget units
- Tooltip on hover: shows dp[i][j] value
- "How to read this table" expandable help section

**Comparison Panel:**
- Side-by-side: DP Result vs Greedy Result
- Show: total return, ROI%, budget used, which investments selected
- Difference callout: "DP outperforms Greedy by ₹X (Y% better)"

**Sensitivity Analysis:**
- Slider: adjust budget from 50% to 200% of original
- Chart updates in real time showing ROI vs Budget curve

**Export Buttons:**
- "Export Results as PDF" — generates PDF with portfolio name, date, selected investments table, ROI summary
- "Export as CSV" — downloads selected investments as CSV

---

### 8. ANALYTICS PAGE (`/app/analytics`)

- **Allocation Pie Chart** (Recharts): budget split by investment category across all portfolios
- **Return Bar Chart**: expected return per investment (sorted descending), with cost overlay as a line
- **ROI Trend Line Chart**: ROI% across all optimization runs over time (last 30 runs)
- **Risk Distribution**: histogram of risk levels (1-5) across all investments
- Portfolio selector dropdown to filter charts by specific portfolio

---

### 9. HISTORY PAGE (`/app/history`)

- Table of all optimization runs with: date, portfolio, budget, optimal return, ROI%, execution time (ms), view button
- Click "View" → opens a modal showing full run details (selected investments, DP table snapshot, comparison with greedy)
- Filter by portfolio, date range

---

### 10. SETTINGS PAGE (`/app/settings`)

- **Profile:** update full name, avatar upload (Supabase storage)
- **Preferences:** default currency, default unit size for DP
- **Security:** change password, active sessions list
- **Danger Zone:** delete account (requires typing "DELETE" confirmation)

---

### 11. SHARED PORTFOLIO PAGE (`/share/:token`) — PUBLIC

- No login required
- Shows: portfolio name, budget, selected investments (from last optimization run), ROI%
- Read-only — no edit controls
- "Sign up to create your own" CTA banner at top
- Handles expired share links gracefully (shows "This link has expired" message)

---

## KEY HOOKS IMPLEMENTATION

### `useOptimizer.ts`
```typescript
export function useOptimizer() {
  const { session } = useAuth()
  
  const optimize = useMutation({
    mutationFn: async ({ portfolioId, budget, investments, unitSize }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ portfolio_id: portfolioId, budget, investments, unit_size: unitSize }),
        }
      )
      if (!response.ok) throw new Error(await response.text())
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Optimization complete! ROI: ${data.dp_result.roi_percent.toFixed(2)}%`)
      queryClient.invalidateQueries({ queryKey: ['optimization-runs'] })
    },
    onError: (err) => toast.error(`Optimization failed: ${err.message}`),
  })
  
  return { optimize, isOptimizing: optimize.isPending }
}
```

### `knapsack.ts` (client-side for demo mode)
```typescript
export function knapsack01(
  investments: Array<{ id: string; cost: number; expected_return: number }>,
  budget: number,
  unitSize: number = 1000
): { selectedIds: string[]; totalReturn: number; totalCost: number; dpTable: number[][] } {
  const n = investments.length
  const W = Math.floor(budget / unitSize)
  const costs = investments.map(inv => Math.floor(inv.cost / unitSize))
  const returns = investments.map(inv => inv.expected_return)
  
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i-1][j]
      if (costs[i-1] <= j) {
        dp[i][j] = Math.max(dp[i][j], dp[i-1][j - costs[i-1]] + returns[i-1])
      }
    }
  }
  
  const selectedIds: string[] = []
  let j = W
  for (let i = n; i >= 1; i--) {
    if (dp[i][j] !== dp[i-1][j]) {
      selectedIds.push(investments[i-1].id)
      j -= costs[i-1]
    }
  }
  
  const totalCost = selectedIds.reduce((sum, id) => {
    return sum + investments.find(inv => inv.id === id)!.cost
  }, 0)
  
  return {
    selectedIds: selectedIds.reverse(),
    totalReturn: dp[n][W],
    totalCost,
    dpTable: dp,
  }
}
```

---

## VERCEL CONFIGURATION

Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-query-devtools": "^5.17.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.303.0",
    "sonner": "^1.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.2.0",
    "papaparse": "^5.4.0",
    "@types/papaparse": "^5.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        slate: '#1B3A6B',
        gold: '#C9A84C',
        'gold-light': '#E8D5A3',
        'blue-mid': '#2D5EA8',
        'gray-soft': '#F5F7FA',
        'gray-mid': '#8A9BB5',
        'text-dark': '#1A2332',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'cell-fill': 'cellFill 0.1s ease-in forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        cellFill: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## CRITICAL IMPLEMENTATION NOTES

1. **DP Heatmap Animation:** The `DPHeatmap.tsx` component must use `requestAnimationFrame` in a loop to animate cells. Each cell should be rendered as a `<div>` inside a CSS Grid with background color interpolated from navy to gold based on `value / maxValue`. Use `useEffect` with the dp snapshot array from the optimization result.

2. **Error Boundaries:** Wrap all page components in React Error Boundaries. Show a friendly error card on failures.

3. **Loading States:** Every async operation (optimization, portfolio load, investment load) must show a skeleton loader, not a spinner. Use TailwindCSS `animate-pulse` on placeholder divs shaped like the real content.

4. **Empty States:** When a user has no portfolios, show an illustrated empty state with a "Create your first portfolio" button. Same for investments within a portfolio.

5. **Mobile Responsiveness:** Every page must work on 375px width. The DP heatmap should be horizontally scrollable on mobile.

6. **CSV Import Format:** Accept CSV with header row: `name,cost,expected_return,category,risk_level`. Parse with papaparse. Validate each row (cost > 0, expected_return >= 0, risk_level 1-5). Show a preview table before importing with a count of valid/invalid rows.

7. **Currency Formatting:** All currency values must be formatted using `Intl.NumberFormat` with the portfolio's currency. For INR, use Indian number system (lakhs/crores).

8. **Supabase Auth Token Refresh:** The app must handle token refresh automatically. Use Supabase's `onAuthStateChange` listener and store the session in React context.

9. **Demo Mode:** The landing page demo section must work WITHOUT a Supabase connection. Run `knapsack01` from `lib/knapsack.ts` client-side with hardcoded sample data.

10. **Type Safety:** Generate Supabase database types using `supabase gen types typescript`. Every database operation must use the generated `Database` type.

---

## SETUP INSTRUCTIONS FOR USER

After Lovable generates the project:

1. Create a Supabase project at supabase.com
2. Run the SQL schema (provided above) in Supabase SQL editor
3. Enable Google OAuth in Supabase Authentication → Providers → Google
4. Deploy Edge Function: `supabase functions deploy optimize-portfolio`
5. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Deploy to Vercel: connect GitHub repo → Vercel will auto-detect Vite config
7. In Supabase Edge Functions settings, add: `SUPABASE_SERVICE_ROLE_KEY`

---

## QUALITY REQUIREMENTS

- Lighthouse Performance score ≥ 90
- Lighthouse Accessibility score ≥ 90
- Zero TypeScript errors (`tsc --noEmit` must pass)
- All routes must have proper meta titles
- All images/icons must have alt text
- All interactive elements must have keyboard focus styles
- No `any` TypeScript types (use proper types everywhere)
- No `console.log` in production code (use conditional logging)
- All forms must have proper ARIA labels

---

**This prompt is complete. Build the entire application as described. Do not skip any section. Do not leave placeholder "TODO" comments. Every component, hook, page, and function described here must be fully implemented and working.**

---

## GITHUB INTEGRATION (AUTO-PUSH)

After generating the project, Lovable must automatically connect and push all code to GitHub using the following configuration:

**Repository name:** `budget-allocator`
**Visibility:** Public
**Default branch:** `main`
**Commit message for initial push:** `feat: initial Budget Allocator SaaS — 0/1 Knapsack portfolio optimizer`

### `.gitignore` (create this file)
```
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
*.log
.supabase/
supabase/.temp/
coverage/
.vite/
```

### `README.md` (create this file)
```markdown
# Budget Allocator

> Optimal investment portfolio allocation powered by the 0/1 Knapsack Dynamic Programming algorithm.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/budget-allocator)

## Live Demo
🔗 https://budget-allocator.vercel.app

## What it does
Budget Allocator takes your investment budget and a list of investment options (stocks, bonds, FDs, etc.), and uses the **0/1 Knapsack DP algorithm** to find the mathematically optimal subset of investments that maximizes your total return without exceeding your budget.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Algorithm:** 0/1 Knapsack Dynamic Programming (Deno/TypeScript Edge Function)
- **Hosting:** Vercel (Frontend) + Supabase (Backend)
- **Charts:** Recharts

## Quick Start

### 1. Clone the repo
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/budget-allocator.git
cd budget-allocator
npm install
\`\`\`

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the SQL editor
3. Deploy the Edge Function:
\`\`\`bash
npx supabase functions deploy optimize-portfolio
\`\`\`

### 3. Configure environment variables
Create `.env.local`:
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 4. Run locally
\`\`\`bash
npm run dev
\`\`\`

### 5. Deploy to Vercel
\`\`\`bash
npx vercel --prod
\`\`\`
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables.

## Algorithm
The core of this app is the **0/1 Knapsack Dynamic Programming** algorithm:

\`\`\`
Maximize:   Σ v_i   for all selected investments i
Subject to: Σ w_i ≤ W   (budget constraint)
            x_i ∈ {0, 1} (each investment chosen at most once)

Time complexity:  O(n × W)
Space complexity: O(W) — space-optimized 1D variant
\`\`\`

## Project Structure
\`\`\`
src/
├── components/     UI components (optimizer, charts, forms)
├── pages/          Route-level page components
├── hooks/          Custom React Query hooks
├── lib/            Supabase client, knapsack algorithm, utils
supabase/
├── functions/      Deno Edge Functions (DP algorithm)
└── schema.sql      Full database schema with RLS
\`\`\`

## License
MIT — free to use for academic and commercial projects.
```

### `supabase/schema.sql` (create this file with the full SQL schema from Section "SUPABASE CONFIGURATION" above)

### GitHub Actions CI/CD — create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx eslint src --ext .ts,.tsx --max-warnings 0

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [typecheck, lint]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitHub Secrets to add (Settings → Secrets → Actions):
```
VITE_SUPABASE_URL         → your Supabase project URL
VITE_SUPABASE_ANON_KEY    → your Supabase anon key
VERCEL_TOKEN              → from vercel.com/account/tokens
VERCEL_ORG_ID             → from .vercel/project.json after first deploy
VERCEL_PROJECT_ID         → from .vercel/project.json after first deploy
```

Once Lovable pushes to GitHub and the CI workflow is live:
- Every push to `main` → auto type-checks, lints, builds, and deploys to Vercel production
- Every pull request → runs type-check + lint as a gate before merge
- Vercel also creates preview URLs for every PR automatically
