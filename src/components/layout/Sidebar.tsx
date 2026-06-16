import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  BarChart2,
  History,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/app/portfolios', icon: Briefcase, label: 'Portfolios', id: 'nav-portfolios' },
  { to: '/app/analytics', icon: BarChart2, label: 'Analytics', id: 'nav-analytics' },
  { to: '/app/history', icon: History, label: 'History', id: 'nav-history' },
  { to: '/app/settings', icon: Settings, label: 'Settings', id: 'nav-settings' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 w-60 bg-navy border-r border-gold/10 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, id }) => {
              const isActive = location.pathname.startsWith(to)
              return (
                <li key={to}>
                  <NavLink
                    id={id}
                    to={to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-gold/15 text-gold'
                        : 'text-gray-mid hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-gold' : 'text-gray-mid group-hover:text-white'
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={14} className="text-gold" />}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t border-gold/10">
          <div className="bg-slate/60 rounded-lg p-3 border border-gold/20">
            <p className="text-gold text-xs font-semibold">0/1 Knapsack DP</p>
            <p className="text-gray-mid text-xs mt-0.5">Mathematical certainty</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-navy border-t border-gold/10 z-50 lg:hidden">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label, id }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                id={`mobile-${id}`}
                to={to}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors',
                  isActive ? 'text-gold' : 'text-gray-mid'
                )}
              >
                <Icon size={20} />
                <span className="hidden xs:block">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
