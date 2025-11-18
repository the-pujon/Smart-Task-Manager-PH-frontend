'use client'

import { useAppSelector } from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Users, Briefcase, CheckSquare, AlertCircle } from 'lucide-react'

export function DashboardStats() {
  const teams = useAppSelector(state => state.teams.teams)
  const projects = useAppSelector(state => state.projects.projects)
  const tasks = useAppSelector(state => state.tasks.tasks)

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0)
  const overloadedMembers = teams.reduce((sum, team) => {
    return sum + team.members.filter(member => {
      const memberTasks = tasks.filter(t => t.assignedMemberId === member.id)
      return memberTasks.length > member.capacity
    }).length
  }, 0)

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'bg-emerald-500/20 text-emerald-400' },
    { label: 'Team Members', value: totalMembers, icon: Users, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Overloaded', value: overloadedMembers, icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card
            key={idx}
            className="p-4 sm:p-6 border-border/60 hover:border-border transition-colors"
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
  )
}
