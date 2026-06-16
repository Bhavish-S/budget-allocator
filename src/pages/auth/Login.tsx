import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Eye, EyeOff, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }: FormData) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/dashboard` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Value prop */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-center px-16 bg-diagonal">
        <div className="max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-navy" strokeWidth={2.5} />
            </div>
            <span className="text-gold text-xl font-bold">Budget Allocator</span>
          </Link>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Optimal portfolio allocation,{' '}
            <span className="gradient-text">mathematically proven.</span>
          </h1>
          <p className="text-gold-light/80 text-lg leading-relaxed">
            The 0/1 Knapsack algorithm finds your exact optimal investment allocation across any budget. No approximations — pure mathematical certainty.
          </p>
          <div className="mt-8 space-y-4">
            {[
              '✓ Visual DP table animation',
              '✓ Compare DP vs Greedy algorithms',
              '✓ Multi-currency portfolio support',
              '✓ CSV import & shareable reports',
            ].map((feat) => (
              <p key={feat} className="text-gold-light text-sm">{feat}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-gold" />
            </div>
            <span className="text-navy font-bold">Budget Allocator</span>
          </Link>

          <h2 className="text-2xl font-bold text-text-dark mb-1">Welcome back</h2>
          <p className="text-gray-mid text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-mid hover:underline font-medium">Sign up free</Link>
          </p>

          {/* Google OAuth */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-text-dark text-sm font-medium mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-mid">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="you@example.com"
                className="input-field"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label mb-0" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="text-blue-mid text-xs hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-text-dark"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <LogIn size={16} />
                  Sign In
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
