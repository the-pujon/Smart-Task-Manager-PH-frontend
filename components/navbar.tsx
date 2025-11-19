'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUserLogoutMutation } from '@/redux/api/authApi'
import { toast } from 'sonner'

export function Navbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [logout, { isLoading }] = useUserLogoutMutation()

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout({}).unwrap()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      // Even if the API call fails, still clear local state
      toast.success('Logged out successfully')
      router.push('/login')
    }
  }

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/20 flex-shrink-0 flex items-center justify-center border border-accent/30">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-accent rounded-sm"></div>
          </div>
          <h2 className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate">Smart Task Manager</h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors gap-1 sm:gap-2 p-1.5 sm:px-3"
              title={mounted ? `Current theme: ${theme}` : 'Theme'}
            >
              {!mounted ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <>
                  {theme === 'light' && <Sun className="w-4 h-4" />}
                  {theme === 'dark' && <Moon className="w-4 h-4" />}
                  {theme === 'system' && <Monitor className="w-4 h-4" />}
                </>
              )}
            </Button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => {
                    setTheme('light')
                    setShowThemeMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => {
                    setTheme('dark')
                    setShowThemeMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-t border-border/40 ${
                    theme === 'dark'
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => {
                    setTheme('system')
                    setShowThemeMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-t border-border/40 ${
                    theme === 'system'
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  System
                </button>
              </div>
            )}
          </div>

          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors p-1.5 sm:px-3"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Settings</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors p-1.5 sm:px-3"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{isLoading ? 'Logging out...' : 'Logout'}</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
