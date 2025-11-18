'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { reassignTask, addActivityLog } from '@/lib/store'
import { useAutoReassign } from '@/lib/useAutoReassign'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { RefreshCw, AlertTriangle, Zap } from 'lucide-react'

export function ReassignmentEngine() {
  const dispatch = useAppDispatch()
  const teams = useAppSelector(state => state.teams.teams)
  const tasks = useAppSelector(state => state.tasks.tasks)
  const { autoReassignEnabled, setAutoReassignEnabled } = useAutoReassign()
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [reassignments, setReassignments] = useState<Array<{ taskId: string; taskName: string; oldAssignee: string | null; newAssignee: string }>>([])
  const autoReassignAppliedRef = useRef(false)

  useEffect(() => {
    if (autoReassignEnabled && !autoReassignAppliedRef.current) {
      const newReassignments = calculateReassignments()
      if (newReassignments.length > 0) {
        handleAutoReassign(newReassignments)
        autoReassignAppliedRef.current = true
      }
    }
  }, [autoReassignEnabled])

  const calculateReassignments = () => {
    const newReassignments: typeof reassignments = []

    teams.forEach(team => {
      team.members.forEach(member => {
        const memberTasks = tasks.filter(t => t.assignedMemberId === member.id && t.status !== 'Done')
        if (memberTasks.length > member.capacity) {
          const movableTasks = memberTasks.filter(t => t.priority !== 'High')

          movableTasks.forEach(task => {
            const availableMember = team.members.find(m => {
              const mTasks = tasks.filter(t => t.assignedMemberId === m.id && t.status !== 'Done')
              return mTasks.length < m.capacity && m.id !== member.id
            })

            if (availableMember) {
              newReassignments.push({
                taskId: task.id,
                taskName: task.title,
                oldAssignee: member.name,
                newAssignee: availableMember.name,
              })
            }
          })
        }
      })
    })

    return newReassignments
  }

  const handleAutoReassign = (reassignmentsToApply: typeof reassignments) => {
    reassignmentsToApply.forEach(reassignment => {
      const task = tasks.find(t => t.id === reassignment.taskId)
      const newAssignee = teams.flatMap(t => t.members).find(m => m.name === reassignment.newAssignee)

      if (task && newAssignee) {
        dispatch(reassignTask({ id: reassignment.taskId, newAssigneeId: newAssignee.id }))
        dispatch(addActivityLog({
          timestamp: new Date().toISOString(),
          taskName: reassignment.taskName,
          oldAssignee: reassignment.oldAssignee,
          newAssignee: reassignment.newAssignee,
          userId: 'current-user',
        }))
      }
    })
  }

  const handleManualReassign = () => {
    reassignments.forEach(reassignment => {
      const task = tasks.find(t => t.id === reassignment.taskId)
      const newAssignee = teams.flatMap(t => t.members).find(m => m.name === reassignment.newAssignee)

      if (task && newAssignee) {
        dispatch(reassignTask({ id: reassignment.taskId, newAssigneeId: newAssignee.id }))
        dispatch(addActivityLog({
          timestamp: new Date().toISOString(),
          taskName: reassignment.taskName,
          oldAssignee: reassignment.oldAssignee,
          newAssignee: reassignment.newAssignee,
          userId: 'current-user',
        }))
      }
    })
    setShowConfirm(false)
    setReassignments([])
  }

  const handleToggleAuto = () => {
    const newState = !autoReassignEnabled
    setAutoReassignEnabled(newState)
    if (newState) {
      autoReassignAppliedRef.current = false
    }
  }

  const handleCalculateClick = () => {
    const newReassignments = calculateReassignments()
    if (newReassignments.length > 0) {
      setReassignments(newReassignments)
      setShowConfirm(true)
    }
  }

  const overloadedMembers = teams.flatMap(team =>
    team.members.filter(member => {
      const memberTasks = tasks.filter(t => t.assignedMemberId === member.id && t.status !== 'Done')
      return memberTasks.length > member.capacity
    })
  )

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Overloaded Members</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              {overloadedMembers.length} team member(s) have more tasks than capacity
            </p>
            {overloadedMembers.map(member => {
              const memberTasks = tasks.filter(t => t.assignedMemberId === member.id && t.status !== 'Done')
              return (
                <div key={member.id} className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  {member.name}: {memberTasks.length}/{member.capacity} tasks
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleCalculateClick}
          className="gap-2 flex-1"
          variant={reassignments.length > 0 ? 'default' : 'outline'}
        >
          <RefreshCw className="w-4 h-4" />
          Calculate Reassignments
        </Button>
        <Button
          onClick={handleToggleAuto}
          variant={autoReassignEnabled ? 'default' : 'outline'}
          className="gap-2"
          title={autoReassignEnabled ? 'Auto-reassign is ON' : 'Auto-reassign is OFF'}
        >
          <Zap className="w-4 h-4" />
          {autoReassignEnabled ? 'Auto ON' : 'Auto OFF'}
        </Button>
      </div>

      {reassignments.length > 0 && (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <h3 className="font-semibold mb-3">Proposed Reassignments ({reassignments.length})</h3>
          <div className="space-y-2">
            {reassignments.map((r, idx) => (
              <div key={idx} className="text-sm flex items-center justify-between p-2 bg-background/50 rounded">
                <div>
                  <p className="font-medium">{r.taskName}</p>
                  <p className="text-xs text-muted-foreground">{r.oldAssignee} → {r.newAssignee}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reassignments</AlertDialogTitle>
            <AlertDialogDescription>
              This will reassign {reassignments.length} task(s) to balance workload. Low and Medium priority tasks will be moved. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleManualReassign} className="bg-primary">
              Apply Reassignments
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
