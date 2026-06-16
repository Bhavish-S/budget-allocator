import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Zap, BarChart2, Layers, CheckCircle, ArrowRight, Github,
  Twitter, FileSpreadsheet, Share2,
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
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-text-dark text-xs font-semibold mb-2">Live DP Table</p>
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
                  backgroundColor: val > 0 ? `rgba(79, 70, 229, ${val / maxVal})` : '#f1f5f9',
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
    <div className="bg-white/80 border border-gray-200 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-text-dark font-bold text-lg">Live Demo</h3>
          <p className="text-gray-mid text-xs mt-0.5 font-medium">Budget: ₹10,00,000</p>
        </div>
        <button
          id="demo-optimize-btn"
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60"
        >
          {isRunning ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Zap size={14} fill="currentColor" />
          )}
          {isRunning ? 'Running DP...' : 'Optimize Now'}
        </button>
      </div>

      {/* Investments list */}
      <div className="space-y-2 mb-5 relative z-10">
        {DEMO_INVESTMENTS.map((inv) => {
          const selected = result?.selectedIds.includes(inv.id)
          return (
            <div
              key={inv.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                result
                  ? selected
                    ? 'bg-success/5 border-success/30 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {result && (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-success shadow-sm' : 'bg-gray-200'
                  }`}>
                    {selected && <CheckCircle size={12} className="text-white" />}
                  </div>
                )}
                <p className={`text-sm font-medium ${selected ? 'text-success-dark' : 'text-text-dark'}`}>{inv.name}</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold text-sm font-mono">{formatCurrency(inv.expected_return, 'INR', true)}</p>
                <p className="text-gray-mid text-xs font-mono font-medium">Cost: {formatCurrency(inv.cost, 'INR', true)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-gray-200 pt-5 space-y-4 relative z-10 animate-fade-in-up">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-gray-mid text-xs font-medium mb-1">Optimal Return</p>
              <p className="text-text-dark font-bold font-mono text-lg">{formatCurrency(result.totalReturn, 'INR', true)}</p>
            </div>
            <div className="bg-success/5 rounded-xl p-3 border border-success/20">
              <p className="text-success-dark text-xs font-medium mb-1">Total ROI</p>
              <p className="text-success font-bold text-lg">
                {result.roiPercent >= 0 ? '+' : ''}{result.roiPercent.toFixed(2)}%
              </p>
            </div>
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
    color: '#10B981', // success
  },
  {
    icon: BarChart2,
    title: 'Visual DP Table',
    desc: 'Watch the algorithm think with an animated heatmap. Each cell reveals the optimal sub-problem solution.',
    color: '#4F46E5', // primary
  },
  {
    icon: Layers,
    title: 'Multi-Portfolio',
    desc: 'Manage unlimited portfolios across INR, USD, EUR, GBP. Switch between them instantly.',
    color: '#0EA5E9', // secondary
  },
  {
    icon: TrendingUp,
    title: 'Greedy Comparison',
    desc: 'Side-by-side comparison with the greedy algorithm. See exactly how much more DP earns.',
    color: '#F59E0B', // warning
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV Import & Export',
    desc: 'Bulk-import investments from spreadsheets. Export results as CSV for further analysis.',
    color: '#64748B', // muted
  },
  {
    icon: Share2,
    title: 'Shareable Reports',
    desc: 'Share your optimized portfolio with a single link. No login required to view.',
    color: '#4338CA', // primary-dark
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" strokeWidth={2.5} />
            </div>
            <span className="text-text-dark font-bold text-lg tracking-tight">Budget Allocator</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-mid hover:text-text-dark text-sm font-medium transition-colors">Features</a>
            <a href="#demo" className="text-gray-mid hover:text-text-dark text-sm font-medium transition-colors">Demo</a>
            <a href="#pricing" className="text-gray-mid hover:text-text-dark text-sm font-medium transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-mid hover:text-text-dark text-sm font-medium transition-colors hidden md:block">
              Sign In
            </Link>
            <Link to="/signup" id="nav-signup-btn" className="bg-text-dark hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Modern abstract gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-text-dark text-xs font-semibold tracking-wide">0/1 Knapsack Dynamic Programming</span>
              </div>

              <h1 className="text-text-dark leading-tight mb-6 tracking-tight" style={{ fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 800 }}>
                Optimize Your{' '}
                <span className="text-primary relative inline-block">
                  Investments
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-light/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/></svg>
                </span>
              </h1>

              <p className="text-gray-mid text-xl leading-relaxed mb-10 max-w-lg">
                The Knapsack algorithm finds your exact optimal portfolio allocation.
                No guessing. No heuristics.{' '}
                <strong className="text-text-dark font-semibold">Mathematical certainty.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  to="/signup"
                  id="hero-cta-primary"
                  className="btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-lg transition-all"
                >
                  Start Optimizing — Free
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#demo"
                  id="hero-cta-demo"
                  className="bg-white border border-gray-200 text-text-dark hover:bg-gray-50 text-base font-semibold px-8 py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center"
                >
                  See Live Demo
                </a>
              </div>

              {/* Counter cards */}
              <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
                {[
                  { value: 240, prefix: '₹', suffix: 'Cr+', label: 'Optimized' },
                  { value: 12400, suffix: '+', label: 'Portfolios' },
                  { value: 99, suffix: '.9%', label: 'Accuracy' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-text-dark text-3xl font-bold tracking-tight">
                      <AnimatedCounter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                    </p>
                    <p className="text-gray-mid text-sm font-medium mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative lg:pl-10">
              <DemoWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-text-dark text-4xl font-bold mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-gray-mid text-lg">Built for serious investors who want absolute mathematical precision in their asset allocation strategy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-background border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className="text-text-dark font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="py-24 px-4 bg-primary relative overflow-hidden">
        {/* Subtle background pattern for primary section */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-white text-4xl font-bold mb-4 tracking-tight">Try It Right Now</h2>
            <p className="text-primary-light/80 text-lg">No login required. Real 0/1 Knapsack DP running instantly in your browser.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <DemoWidget />
          </div>
          <div className="text-center mt-12">
            <Link to="/signup" id="demo-cta-btn" className="bg-white text-primary hover:bg-gray-50 px-8 py-3.5 rounded-lg text-base font-bold shadow-lg transition-colors inline-flex items-center gap-2">
              Want your own portfolios? Sign up free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-text-dark text-4xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-gray-mid text-lg">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 relative transition-transform hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-text-dark text-white shadow-xl scale-105 z-10 border border-gray-800'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-bold text-xl mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-text-dark'
                }`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-gray-400' : 'text-gray-mid'}`}>
                  {plan.desc}
                </p>
                <div className="mb-8">
                  <span className={`text-5xl font-bold tracking-tight ${
                    plan.highlighted ? 'text-white' : 'text-text-dark'
                  }`}>{plan.price}</span>
                  <span className={`text-sm ml-1 font-medium ${
                    plan.highlighted ? 'text-gray-400' : 'text-gray-mid'
                  }`}>{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm">
                      <CheckCircle
                        size={18}
                        className={plan.highlighted ? 'text-primary-light' : 'text-success'}
                      />
                      <span className={`font-medium ${plan.highlighted ? 'text-gray-200' : 'text-text-dark'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  id={`pricing-${plan.name.toLowerCase()}-btn`}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    plan.highlighted
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-background border border-gray-200 text-text-dark hover:bg-gray-100 hover:border-gray-300'
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
      <footer className="bg-white border-t border-gray-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-primary" strokeWidth={2.5} />
                </div>
                <span className="text-text-dark font-bold text-lg tracking-tight">Budget Allocator</span>
              </Link>
              <p className="text-gray-mid text-sm leading-relaxed max-w-sm font-medium">
                Mathematical portfolio optimization using the 0/1 Knapsack algorithm. Built for serious investors looking to maximize their ROI.
              </p>
            </div>
            <div>
              <h4 className="text-text-dark font-bold mb-4 text-sm tracking-wide">PRODUCT</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Demo'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-gray-mid hover:text-primary text-sm font-medium transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-text-dark font-bold mb-4 text-sm tracking-wide">ACCOUNT</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Sign Up', to: '/signup' },
                  { label: 'Sign In', to: '/login' },
                  { label: 'Dashboard', to: '/app/dashboard' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-gray-mid hover:text-primary text-sm font-medium transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-mid text-sm font-medium">
              © {new Date().getFullYear()} Budget Allocator. Built with ❤️ and O(n×W) complexity.
            </p>
            <div className="flex items-center gap-5">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-text-dark transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
