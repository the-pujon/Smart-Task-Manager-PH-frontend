'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth, initializeTeams, initializeProjects, initializeTasks, initializeActivity } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { DashboardStats } from '@/components/dashboard-stats'
import { ActivityPanel } from '@/components/activity-panel'
import { Sidebar } from '@/components/sidebar'
import Link from 'next/link'

const ITEMS_LIMIT = 5

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentUserId = useAppSelector(state => state.auth.currentUserId)
  const teams = useAppSelector(state => state.teams.teams)
  const projects = useAppSelector(state => state.projects.projects)
  const activityLogs = useAppSelector(state => state.activity.logs)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    dispatch(initializeAuth())
    dispatch(initializeTeams())
    dispatch(initializeProjects())
    dispatch(initializeTasks())
    dispatch(initializeActivity())
    setInitialized(true)
  }, [dispatch])

  useEffect(() => {
    if (initialized && !currentUserId) {
      router.push('/login')
    }
  }, [initialized, currentUserId, router])

  if (!initialized || !currentUserId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const limitedTeams = teams.slice(0, ITEMS_LIMIT)
  const limitedProjects = projects.slice(0, ITEMS_LIMIT)
  const limitedActivity = activityLogs.slice(0, ITEMS_LIMIT)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:max-w-7xl lg:mx-auto">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage teams, projects, and tasks efficiently</p>
          </div>

          <DashboardStats />

          <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Latest Teams */}
              <Card className="border-border/60 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">Latest Teams</h2>
                  {teams.length > ITEMS_LIMIT && (
                    <Link href="/dashboard/teams" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">More</Button>
                    </Link>
                  )}
                </div>
                {limitedTeams.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">No teams yet</p>
                ) : (
                  <div className="space-y-2">
                    {limitedTeams.map(team => (
                      <div key={team.id} className="p-2 sm:p-3 bg-secondary/30 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{team.name}</p>
                          <p className="text-xs text-muted-foreground">{team.members.length} members</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Latest Projects */}
              <Card className="border-border/60 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">Latest Projects</h2>
                  {projects.length > ITEMS_LIMIT && (
                    <Link href="/dashboard/projects" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">More</Button>
                    </Link>
                  )}
                </div>
                {limitedProjects.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">No projects yet</p>
                ) : (
                  <div className="space-y-2">
                    {limitedProjects.map(project => (
                      <div key={project.id} className="p-2 sm:p-3 bg-secondary/30 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Activity Panel */}
            <div>
              <Card className="border-border/60 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">Latest Activity</h2>
                  {activityLogs.length > ITEMS_LIMIT && (
                    <Link href="/dashboard/activity" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">More</Button>
                    </Link>
                  )}
                </div>
                {limitedActivity.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {limitedActivity.map(log => (
                      <div key={log.id} className="text-xs border-b border-border/40 pb-2 last:border-0">
                        <p className="font-medium text-foreground truncate">{log.taskName}</p>
                        <p className="text-muted-foreground text-xs truncate">{log.oldAssignee} → {log.newAssignee}</p>
                        <p className="text-muted-foreground text-xs mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
