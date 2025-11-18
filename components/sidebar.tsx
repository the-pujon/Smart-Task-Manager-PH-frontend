'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Folder, CheckSquare, Activity, Settings, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMobileMenu } from '@/lib/useMobileMenu'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Teams', href: '/dashboard/teams', icon: Users },
  { label: 'Projects', href: '/dashboard/projects', icon: Folder },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Activity', href: '/dashboard/activity', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useMobileMenu()

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed left-4 top-20 z-40 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          left-0 top-20 bottom-0
          w-64 bg-card border-r border-border/60
          overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:sticky lg:h-[calc(100vh-80px)]
        `}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-6 mt-6 border-t border-border/40">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Settings</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}
