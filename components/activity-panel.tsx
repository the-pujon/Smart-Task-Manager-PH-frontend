'use client'

import { useAppSelector } from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight } from 'lucide-react'

interface ActivityPanelProps {
  fullPage?: boolean
}

export function ActivityPanel({ fullPage = false }: ActivityPanelProps) {
  const logs = useAppSelector(state => state.activity.logs)
  const displayLogs = fullPage ? logs : logs.slice(0, 5)

  return (
    <div>
      {!fullPage && (
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {displayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              displayLogs.map(log => (
                <div key={log.id} className="text-sm border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-primary">{log.taskName}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.oldAssignee || 'Unassigned'} → {log.newAssignee || 'Unassigned'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
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
            displayLogs.map(log => (
              <Card key={log.id} className="p-4 border-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{log.taskName}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reassigned from <span className="font-medium">{log.oldAssignee || 'Unassigned'}</span> to <span className="font-medium">{log.newAssignee || 'Unassigned'}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
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
