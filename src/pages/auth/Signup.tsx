import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Eye, EyeOff, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const schema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function Signup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ full_name, email, password }: FormData) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Welcome to Budget Allocator.')
      navigate('/app/dashboard')
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
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-center px-16 bg-diagonal">
        <div className="max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-navy" strokeWidth={2.5} />
            </div>
            <span className="text-gold text-xl font-bold">Budget Allocator</span>
          </Link>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Start optimizing your <span className="gradient-text">investment portfolio</span> today.
          </h1>
          <p className="text-gold-light/80 text-lg">
            Free forever for up to 3 portfolios. No credit card required.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: '3', label: 'Free Portfolios' },
              { value: '20', label: 'Investments Each' },
              { value: '10×', label: 'Optimizations/mo' },
            ].map((stat) => (
              <div key={stat.label} className="card-dark text-center">
                <p className="text-gold text-2xl font-bold">{stat.value}</p>
                <p className="text-gold-light/70 text-xs mt-1">{stat.label}</p>
              </div>
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

          <h2 className="text-2xl font-bold text-text-dark mb-1">Create your account</h2>
          <p className="text-gray-mid text-sm mb-8">
            Already have one?{' '}
            <Link to="/login" className="text-blue-mid hover:underline font-medium">Sign in</Link>
          </p>

          <button
            id="google-signup-btn"
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
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-mid">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="signup-name">Full Name</label>
              <input id="signup-name" autoComplete="name" {...register('full_name')} placeholder="Rahul Sharma" className="input-field" />
              {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" autoComplete="email" {...register('email')} placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...register('password')} placeholder="Min. 8 characters" className="input-field pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid" aria-label="Toggle password">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="signup-confirm">Confirm Password</label>
              <input id="signup-confirm" type="password" autoComplete="new-password" {...register('confirm_password')} placeholder="••••••••" className="input-field" />
              {errors.confirm_password && <p className="error-text">{errors.confirm_password.message}</p>}
            </div>

            <button id="signup-submit-btn" type="submit" disabled={isLoading} className="w-full btn-primary py-3">
              {isLoading ? 'Creating account...' : <span className="flex items-center gap-2 justify-center"><UserPlus size={16} />Create Free Account</span>}
            </button>

            <p className="text-gray-mid text-xs text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
