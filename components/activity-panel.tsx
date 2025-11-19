'use client'

import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Package, UserPlus, Users } from 'lucide-react'
import { useGetActivityLogsQuery } from '@/redux/api/activityLogApi'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityPanelProps {
  fullPage?: boolean
}

interface ActivityLog {
  _id: string
  activityType: string
  description: string
  user?: {
    _id: string
    name: string
    email: string
  }
  project?: {
    _id: string
    name: string
  }
  task?: {
    _id: string
    title: string
  }
  fromMember?: {
    _id: string
    name: string
    role: string
  }
  toMember?: {
    _id: string
    name: string
    role: string
  }
  metadata?: {
    taskTitle?: string
    fromMemberName?: string
    toMemberName?: string
    priority?: string
    reason?: string
    projectName?: string
    memberName?: string
    teamId?: string
  }
  createdAt: string
  updatedAt: string
}

export function ActivityPanel({ fullPage = false }: ActivityPanelProps) {
  const { data, isLoading, isError } = useGetActivityLogsQuery({ 
    page: 1, 
    limit: fullPage ? 50 : 5 
  })
  
  const logs = data?.data || []
  const displayLogs = logs

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'PROJECT_CREATED':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'TASK_ASSIGNED':
        return <UserPlus className="w-4 h-4 text-green-500" />
      case 'TASK_REASSIGNED':
        return <ArrowRight className="w-4 h-4 text-orange-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div>
        {!fullPage ? (
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">Failed to load activity logs</p>
      </Card>
    )
  }

  return (
    <div>
      {!fullPage && (
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {displayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              displayLogs.map((log: ActivityLog) => (
                <div key={log._id} className="text-sm border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-2 text-xs">
                    {getActivityIcon(log.activityType)}
                    <span className="font-semibold text-primary">
                      {log.task?.title || log.project?.name || 'Activity'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.activityType === 'TASK_REASSIGNED' && (
                      <>
                        {log.fromMember?.name || 'Unassigned'} → {log.toMember?.name || 'Unassigned'}
                      </>
                    )}
                    {log.activityType === 'TASK_ASSIGNED' && (
                      <>Assigned to {log.toMember?.name}</>
                    )}
                    {log.activityType === 'PROJECT_CREATED' && (
                      <>Created by {log.user?.name}</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {fullPage && (
        <div className="space-y-3">
          {displayLogs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No activity yet</p>
            </Card>
          ) : (
            displayLogs.map((log: ActivityLog) => (
              <Card key={log._id} className="p-4 border-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(log.activityType)}
                      <span className="font-semibold text-foreground">
                        {log.task?.title || log.project?.name || 'Activity'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {log.description}
                    </p>
                    {log.metadata?.reason && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Reason: {log.metadata.reason}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
