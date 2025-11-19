'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth, initializeProjects } from '@/lib/store'
import { useAutoReassign } from '@/lib/useAutoReassign'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { ProjectManager } from '@/components/project-manager'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default function ProjectsPage() {
  const { autoReassignEnabled, setAutoReassignEnabled } = useAutoReassign()


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Projects</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage your projects and deliverables</p>
            </div>
            <Button
              onClick={() => setAutoReassignEnabled(!autoReassignEnabled)}
              variant={autoReassignEnabled ? 'default' : 'outline'}
              className="gap-2 w-full sm:w-auto whitespace-nowrap"
              size="sm"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{autoReassignEnabled ? 'Auto Reassign On' : 'Auto Reassign Off'}</span>
              <span className="sm:hidden">{autoReassignEnabled ? 'On' : 'Off'}</span>
            </Button>
          </div>
          <Card className="border-border/60 p-4 sm:p-6">
            <ProjectManager />
          </Card>
        </main>
      </div>
    </div>
  )
}
