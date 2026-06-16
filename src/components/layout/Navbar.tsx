import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, ChevronDown, Settings, LogOut, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  onMenuToggle?: () => void
  menuOpen?: boolean
}

export default function Navbar({ onMenuToggle, menuOpen }: NavbarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0].toUpperCase() || 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy border-b border-gold/10 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-mid hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-navy" strokeWidth={2.5} />
            </div>
            <span className="font-sans font-800 text-gold text-lg tracking-tight hidden sm:block" style={{ fontWeight: 800 }}>
              Budget Allocator
            </span>
          </Link>
        </div>

        {/* Right: User Avatar Dropdown */}
        <div className="relative">
          <button
            id="user-dropdown-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-navy font-bold text-sm">
              {initials}
            </div>
            <span className="text-white text-sm hidden sm:block max-w-32 truncate">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <ChevronDown size={14} className={`text-gray-mid transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-slate border border-gold/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gold/10">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-gray-mid text-xs truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/app/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-mid hover:text-white hover:bg-white/5 transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button
                    id="signout-btn"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-danger hover:bg-danger/10 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
