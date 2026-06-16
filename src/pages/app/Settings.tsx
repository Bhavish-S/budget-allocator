import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Shield, Sliders, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.user_metadata?.full_name || '' },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const handleProfileSave = async (data: ProfileForm) => {
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: data.full_name } })
    setSavingProfile(false)
    if (error) toast.error(error.message)
    else toast.success('Profile updated!')
  }

  const handlePasswordChange = async (data: PasswordForm) => {
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    setSavingPassword(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Password changed!')
      passwordForm.reset()
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeletingAccount(true)
    await signOut()
    navigate('/')
    toast.success('Account deleted.')
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section id="profile" className="card-light">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <User size={16} className="text-gold" />
            </div>
            <h2 className="font-semibold text-text-dark">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-navy font-bold text-xl">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold text-text-dark">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-gray-mid text-sm">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <div>
              <label className="label" htmlFor="settings-name">Full Name</label>
              <input id="settings-name" {...profileForm.register('full_name')} className="input-field" />
              {profileForm.formState.errors.full_name && (
                <p className="error-text">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <button id="save-profile-btn" type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Security */}
        <section id="security" className="card-light">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-gold" />
            </div>
            <h2 className="font-semibold text-text-dark">Security</h2>
          </div>

          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <div>
              <label className="label" htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" {...passwordForm.register('password')} placeholder="Min. 8 characters" className="input-field" />
              {passwordForm.formState.errors.password && (
                <p className="error-text">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="confirm-password">Confirm Password</label>
              <input id="confirm-password" type="password" {...passwordForm.register('confirm')} placeholder="••••••••" className="input-field" />
              {passwordForm.formState.errors.confirm && (
                <p className="error-text">{passwordForm.formState.errors.confirm.message}</p>
              )}
            </div>
            <button id="change-password-btn" type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section id="danger" className="card-light border-2 border-danger/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-danger" />
            </div>
            <h2 className="font-semibold text-danger">Danger Zone</h2>
          </div>

          <p className="text-gray-mid text-sm mb-4">
            Permanently delete your account and all portfolios. Type <strong>DELETE</strong> to confirm.
          </p>
          <div className="flex gap-3">
            <input
              id="delete-confirm-input"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="input-field flex-1"
            />
            <button
              id="delete-account-btn"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deletingAccount}
              className="btn-danger flex-shrink-0"
            >
              {deletingAccount ? <Loader2 size={16} className="animate-spin" /> : 'Delete Account'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
