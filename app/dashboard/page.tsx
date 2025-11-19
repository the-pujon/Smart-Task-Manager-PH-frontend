'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDashboardQuery } from '@/redux/api/dashboardApi'
import { Users, Briefcase, CheckSquare, AlertCircle, Package, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery({})
  
  const stats = data?.data?.stats
  const latestTeams = data?.data?.latestTeams || []
  const latestProjects = data?.data?.latestProjects || []
  const latestActivities = data?.data?.latestActivities || []

  const statsConfig = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    { label: 'Team Members', value: stats?.teamMembers || 0, icon: Users, color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
    { label: 'Overloaded', value: stats?.overloaded || 0, icon: AlertCircle, color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  ]

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'PROJECT_CREATED':
        return <Package className="w-3.5 h-3.5 text-blue-500" />
      case 'TASK_ASSIGNED':
        return <CheckSquare className="w-3.5 h-3.5 text-green-500" />
      case 'TASK_REASSIGNED':
        return <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
      default:
        return <Users className="w-3.5 h-3.5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:max-w-7xl lg:mx-auto">
            <div className="mb-6 sm:mb-10">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <Card className="p-6 text-center">
              <p className="text-destructive">Failed to load dashboard data</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {statsConfig.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card
                  key={idx}
                  className="p-4 sm:p-6 border-border/60 hover:border-border transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-tight">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3 text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Latest Teams */}
              <Card className="border-border/60 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <h2 className="text-base sm:text-lg font-bold">Latest Teams</h2>
                  </div>
                  {latestTeams.length > 0 && (
                    <Link href="/dashboard/teams" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">View All</Button>
                    </Link>
                  )}
                </div>
                {latestTeams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No teams yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestTeams.map((team: any) => (
                      <div key={team._id} className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg border border-border/50 hover:border-purple-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{team.name}</p>
                            <div className="flex gap-4 mt-2">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {team.totalMembers} members
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {team.totalProjects} projects
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Latest Projects */}
              <Card className="border-border/60 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <h2 className="text-base sm:text-lg font-bold">Latest Projects</h2>
                  </div>
                  {latestProjects.length > 0 && (
                    <Link href="/dashboard/projects" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">View All</Button>
                    </Link>
                  )}
                </div>
                {latestProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestProjects.map((project: any) => (
                      <div key={project._id} className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg border border-border/50 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{project.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                            <div className="flex gap-4 mt-2">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.assignedTeam?.name}
                              </p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Activity Panel */}
            <div>
              <Card className="border-border/60 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-base sm:text-lg font-bold">Recent Activity</h2>
                  </div>
                  {latestActivities.length > 0 && (
                    <Link href="/dashboard/activity" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">View All</Button>
                    </Link>
                  )}
                </div>
                {latestActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestActivities.map((log: any) => (
                      <div key={log._id} className="border-b border-border/40 pb-3 last:border-0 hover:bg-secondary/30 p-2 rounded-lg transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {getActivityIcon(log.activityType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {log.task?.title || log.project?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {log.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
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
