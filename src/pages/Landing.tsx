import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Zap, BarChart2, Layers, CheckCircle, ArrowRight, Github,
  Twitter, Shield, PieChart, Lock, Home, Gem, FileSpreadsheet, Share2, Star,
} from 'lucide-react'
import { knapsack01 } from '@/lib/knapsack'
import { formatCurrency, interpolateColor } from '@/lib/utils'

// Demo investments (no auth needed)
const DEMO_INVESTMENTS = [
  { id: '1', name: 'Reliance Industries', cost: 200000, expected_return: 260000 },
  { id: '2', name: 'Axis Bank FD (3yr)', cost: 150000, expected_return: 183000 },
  { id: '3', name: 'Nifty 50 ETF', cost: 300000, expected_return: 378000 },
  { id: '4', name: 'SBI Mutual Fund', cost: 250000, expected_return: 310000 },
  { id: '5', name: 'Government Bond 10yr', cost: 100000, expected_return: 118000 },
]
const DEMO_BUDGET = 1000000

function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const step = target / 60
          const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
          }, 16)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

function MiniHeatmap({ dp }: { dp: number[][] }) {
  const rows = Math.min(dp.length, 12)
  const cols = Math.min(dp[0]?.length || 0, 20)
  const maxVal = Math.max(...dp.flat())

  return (
    <div className="rounded-xl overflow-hidden border border-gold/20 bg-navy p-3">
      <p className="text-gold text-xs font-semibold mb-2">Live DP Table</p>
      <div className="space-y-0.5">
        {dp.slice(1, rows).map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.slice(0, cols).map((val, ci) => (
              <div
                key={ci}
                className="rounded-sm"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: interpolateColor(val, maxVal || 1),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoWidget() {
  const [result, setResult] = useState<ReturnType<typeof knapsack01> | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => {
      const res = knapsack01(DEMO_INVESTMENTS, DEMO_BUDGET, 50000)
      setResult(res)
      setIsRunning(false)
    }, 600)
  }

  return (
    <div className="bg-navy/80 border border-gold/20 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Live Demo</h3>
          <p className="text-gold-light/70 text-xs mt-0.5">Budget: ₹10,00,000</p>
        </div>
        <button
          id="demo-optimize-btn"
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold text-sm rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
        >
          {isRunning ? (
            <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
          ) : (
            <Zap size={14} fill="currentColor" />
          )}
          {isRunning ? 'Running DP...' : 'Optimize Now'}
        </button>
      </div>

      {/* Investments list */}
      <div className="space-y-2 mb-4">
        {DEMO_INVESTMENTS.map((inv) => {
          const selected = result?.selectedIds.includes(inv.id)
          return (
            <div
              key={inv.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                result
                  ? selected
                    ? 'bg-success/10 border-success/30'
                    : 'bg-white/5 border-white/10 opacity-50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {result && (
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-success' : 'bg-white/20'
                  }`}>
                    {selected && <CheckCircle size={10} className="text-white" />}
                  </div>
                )}
                <p className="text-white text-xs font-medium">{inv.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gold text-xs font-mono">{formatCurrency(inv.expected_return, 'INR', true)}</p>
                <p className="text-white/50 text-xs font-mono">{formatCurrency(inv.cost, 'INR', true)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-gold/20 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gold-light text-sm">Optimal Return</p>
            <p className="text-white font-bold font-mono">{formatCurrency(result.totalReturn, 'INR', true)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gold-light text-sm">ROI</p>
            <p className="text-success font-bold text-lg">
              {result.roiPercent >= 0 ? '+' : ''}{result.roiPercent.toFixed(2)}%
            </p>
          </div>
          <MiniHeatmap dp={result.dpTable} />
        </div>
      )}
    </div>
  )
}

const FEATURES = [
  {
    icon: CheckCircle,
    title: 'Exact Optimization',
    desc: '0/1 Knapsack DP — not approximations. Mathematically proven optimal allocation.',
    color: '#16A34A',
  },
  {
    icon: BarChart2,
    title: 'Visual DP Table',
    desc: 'Watch the algorithm think with an animated heatmap. Each cell reveals the optimal sub-problem solution.',
    color: '#C9A84C',
  },
  {
    icon: Layers,
    title: 'Multi-Portfolio',
    desc: 'Manage unlimited portfolios across INR, USD, EUR, GBP. Switch between them instantly.',
    color: '#2D5EA8',
  },
  {
    icon: TrendingUp,
    title: 'Greedy Comparison',
    desc: 'Side-by-side comparison with the greedy algorithm. See exactly how much more DP earns.',
    color: '#D97706',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV Import & Export',
    desc: 'Bulk-import investments from spreadsheets. Export results as CSV for further analysis.',
    color: '#8A9BB5',
  },
  {
    icon: Share2,
    title: 'Shareable Reports',
    desc: 'Share your optimized portfolio with a single link. No login required to view.',
    color: '#1B3A6B',
  },
]

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    desc: 'Perfect for getting started',
    features: [
      '3 portfolios',
      '20 investments each',
      '10 optimizations/month',
      'DP heatmap visualization',
      'Greedy comparison',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'For serious investors',
    features: [
      'Unlimited portfolios',
      '200 investments each',
      'Unlimited optimizations',
      'CSV export',
      'Shareable links',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '₹1,999',
    period: '/month',
    desc: 'For investment teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-navy" strokeWidth={2.5} />
            </div>
            <span className="text-gold font-bold text-lg">Budget Allocator</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-mid hover:text-white text-sm transition-colors">Features</a>
            <a href="#demo" className="text-gray-mid hover:text-white text-sm transition-colors">Demo</a>
            <a href="#pricing" className="text-gray-mid hover:text-white text-sm transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-mid hover:text-white text-sm transition-colors hidden md:block">
              Sign In
            </Link>
            <Link to="/signup" id="nav-signup-btn" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-diagonal relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-gold text-xs font-semibold">0/1 Knapsack Dynamic Programming</span>
              </div>

              <h1 className="text-white leading-tight mb-6" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800 }}>
                Optimize Your{' '}
                <span className="gradient-text">Investments</span>
              </h1>

              <p className="text-gold-light/80 text-lg leading-relaxed mb-8">
                The 0/1 Knapsack algorithm finds your exact optimal portfolio allocation.
                No guessing. No heuristics.{' '}
                <strong className="text-gold-light">Mathematical certainty.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/signup"
                  id="hero-cta-primary"
                  className="btn-primary text-base px-8 py-3"
                >
                  Start Optimizing — Free
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#demo"
                  id="hero-cta-demo"
                  className="btn-secondary text-base px-8 py-3"
                >
                  See Live Demo
                </a>
              </div>

              {/* Counter cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 240, prefix: '₹', suffix: 'Cr+', label: 'Optimized' },
                  { value: 12400, suffix: '+', label: 'Portfolios' },
                  { value: 99, suffix: '.9%', label: 'Accuracy' },
                ].map((stat) => (
                  <div key={stat.label} className="card-dark text-center">
                    <p className="text-gold text-xl font-bold">
                      <AnimatedCounter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                    </p>
                    <p className="text-gold-light/60 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent blur-3xl opacity-30 rounded-full" />
              <DemoWidget />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-gold-light/70">Three simple steps to mathematical portfolio perfection</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Set Your Budget & Add Investments',
                desc: 'Create a portfolio with your total budget. Add investment options with their cost and expected return. Import from CSV if you have many.',
              },
              {
                step: '02',
                title: 'Click Optimize',
                desc: 'Our 0/1 Knapsack DP algorithm runs in milliseconds — even for 500+ investments. Watch the animated DP table fill in real time.',
              },
              {
                step: '03',
                title: 'Get Your Exact Optimal Allocation',
                desc: 'See exactly which investments to pick, your maximum possible return, ROI%, and how it compares to the greedy algorithm.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card-dark relative">
                <div className="text-gold/20 text-8xl font-bold absolute top-4 right-4 leading-none font-mono">{step}</div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center mb-4 text-navy font-bold">
                    {parseInt(step)}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gold-light/70 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-soft">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-text-dark text-3xl font-bold mb-3">Everything You Need</h2>
            <p className="text-gray-mid">Built for serious investors who want mathematical precision</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-text-dark font-semibold mb-2">{title}</h3>
                <p className="text-gray-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="py-20 px-4 bg-navy bg-diagonal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl font-bold mb-3">Try It Right Now</h2>
            <p className="text-gold-light/70">No login required. Real 0/1 Knapsack DP running in your browser.</p>
          </div>
          <div className="max-w-lg mx-auto">
            <DemoWidget />
          </div>
          <div className="text-center mt-8">
            <Link to="/signup" id="demo-cta-btn" className="btn-primary text-base px-8 py-3">
              Want your own portfolios? Sign up free
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-soft">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-text-dark text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-mid">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 relative ${
                  plan.highlighted
                    ? 'bg-navy text-white border-2 border-gold shadow-2xl scale-105'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${
                  plan.highlighted ? 'text-gold' : 'text-text-dark'
                }`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-gold-light/70' : 'text-gray-mid'}`}>
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold font-mono ${
                    plan.highlighted ? 'text-white' : 'text-text-dark'
                  }`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${
                    plan.highlighted ? 'text-gold-light/70' : 'text-gray-mid'
                  }`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        size={15}
                        className={plan.highlighted ? 'text-gold' : 'text-success'}
                      />
                      <span className={plan.highlighted ? 'text-gold-light' : 'text-text-dark'}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  id={`pricing-${plan.name.toLowerCase()}-btn`}
                  className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-gold text-navy hover:bg-yellow-400'
                      : 'border border-gray-200 text-text-dark hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy border-t border-gold/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-navy" />
                </div>
                <span className="text-gold font-bold">Budget Allocator</span>
              </Link>
              <p className="text-gold-light/60 text-sm leading-relaxed max-w-sm">
                Mathematical portfolio optimization using the 0/1 Knapsack Dynamic Programming algorithm. Built for serious investors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Demo'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-gold-light/60 hover:text-gold-light text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Sign Up', to: '/signup' },
                  { label: 'Sign In', to: '/login' },
                  { label: 'Dashboard', to: '/app/dashboard' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-gold-light/60 hover:text-gold-light text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gold-light/40 text-sm">
              © {new Date().getFullYear()} Budget Allocator. Built with ❤️ and O(n×W) complexity.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gold-light/40 hover:text-gold-light transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gold-light/40 hover:text-gold-light transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
