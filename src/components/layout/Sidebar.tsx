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
          'fixed left-0 top-16 bottom-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
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
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-text-muted hover:text-text-dark hover:bg-gray-50'
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={14} className="text-primary" />}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-primary-light/50 rounded-lg p-3 border border-primary/10">
            <p className="text-primary text-xs font-semibold">0/1 Knapsack DP</p>
            <p className="text-text-muted text-xs mt-0.5">Mathematical certainty</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
                  isActive ? 'text-primary font-medium' : 'text-text-muted hover:text-text-dark'
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
