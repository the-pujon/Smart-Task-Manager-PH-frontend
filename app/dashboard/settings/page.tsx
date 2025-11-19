'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:max-w-4xl lg:mx-auto">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Settings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Customize your application preferences</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border-border/60 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">Theme</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Choose your preferred color scheme</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    theme === 'light'
                      ? 'border-accent bg-accent/5'
                      : 'border-border/60 hover:border-border/80'
                  }`}
                >
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium">Light</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-accent bg-accent/5'
                      : 'border-border/60 hover:border-border/80'
                  }`}
                >
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium">Dark</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    theme === 'system'
                      ? 'border-accent bg-accent/5'
                      : 'border-border/60 hover:border-border/80'
                  }`}
                >
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium">System</span>
                </button>
              </div>
            </Card>

            <Card className="border-border/60 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4">About</h2>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>Smart Task Manager v1.0</p>
                <p>Manage your teams, projects, and tasks efficiently</p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
