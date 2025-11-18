'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { createProject, createTask, updateTask, deleteTask, deleteProject, addActivityLog, reassignTask } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Edit2, AlertCircle, Zap } from 'lucide-react'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name required'),
  teamId: z.string().min(1, 'Team required'),
})

const taskSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string(),
  assignedMemberId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Low'),
  status: z.enum(['Pending', 'In Progress', 'Done']).default('Pending'),
})

type ProjectFormData = z.infer<typeof projectSchema>
type TaskFormData = z.infer<typeof taskSchema>

export function ProjectManager() {
  const dispatch = useAppDispatch()
  const teams = useAppSelector(state => state.teams.teams)
  const projects = useAppSelector(state => state.projects.projects)
  const tasks = useAppSelector(state => state.tasks.tasks)
  
  const [openProject, setOpenProject] = useState(false)
  const [openTask, setOpenTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [capacityWarning, setCapacityWarning] = useState<{ show: boolean; message: string; onConfirm: () => void }>({
    show: false,
    message: '',
    onConfirm: () => {},
  })

  const projectForm = useForm<ProjectFormData>({ resolver: zodResolver(projectSchema) })
  const taskForm = useForm<TaskFormData>({ 
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'Low',
      status: 'Pending',
      assignedMemberId: undefined,
    }
  })

  const onCreateProject = (data: ProjectFormData) => {
    dispatch(createProject({ name: data.name, teamId: data.teamId }))
    projectForm.reset()
    setOpenProject(false)
  }

  const getAutoAssignMember = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return null

    let memberWithLeastTasks = team.members[0]
    let minTasks = tasks.filter(t => t.assignedMemberId === memberWithLeastTasks?.id).length

    team.members.forEach(member => {
      const memberTasks = tasks.filter(t => t.assignedMemberId === member.id)
      if (memberTasks.length < minTasks) {
        memberWithLeastTasks = member
        minTasks = memberTasks.length
      }
    })

    return memberWithLeastTasks
  }

  const onSaveTask = (data: TaskFormData) => {
    if (!selectedProjectId) return

    const project = projects.find(p => p.id === selectedProjectId)
    const team = teams.find(t => t.id === project?.teamId)
    
    if (data.assignedMemberId && !editingTaskId) {
      const assignee = team?.members.find(m => m.id === data.assignedMemberId)
      const memberTaskCount = tasks.filter(t => t.assignedMemberId === data.assignedMemberId).length

      if (assignee && memberTaskCount >= assignee.capacity) {
        setCapacityWarning({
          show: true,
          message: `${assignee.name} has ${memberTaskCount} tasks but capacity is ${assignee.capacity}. Assign anyway?`,
          onConfirm: () => commitTaskSave(data, project, team, assignee),
        })
        return
      }
    }

    commitTaskSave(data, project, team)
  }

  const commitTaskSave = (data: TaskFormData, project: any, team: any, oldAssignee?: any) => {
    if (!selectedProjectId) return

    if (editingTaskId) {
      const oldTask = tasks.find(t => t.id === editingTaskId)
      dispatch(updateTask({
        id: editingTaskId,
        updates: { ...data, projectId: selectedProjectId, assignedMemberId: data.assignedMemberId || null }
      }))

      if (oldTask && oldTask.assignedMemberId !== data.assignedMemberId) {
        const oldAssigneeName = team?.members.find(m => m.id === oldTask.assignedMemberId)?.name || 'Unassigned'
        const newAssigneeName = team?.members.find(m => m.id === data.assignedMemberId)?.name || 'Unassigned'
        
        dispatch(addActivityLog({
          timestamp: new Date().toISOString(),
          taskName: data.title,
          oldAssignee: oldAssigneeName,
          newAssignee: newAssigneeName,
          userId: 'current-user',
        }))
      }
    } else {
      const newAssigneeId = data.assignedMemberId || null
      dispatch(createTask({
        ...data,
        projectId: selectedProjectId,
        assignedMemberId: newAssigneeId
      }))

      if (newAssigneeId) {
        const assigneeName = team?.members.find(m => m.id === newAssigneeId)?.name
        dispatch(addActivityLog({
          timestamp: new Date().toISOString(),
          taskName: data.title,
          oldAssignee: null,
          newAssignee: assigneeName || 'Assigned',
          userId: 'current-user',
        }))
      }
    }

    taskForm.reset()
    setOpenTask(false)
    setCapacityWarning({ show: false, message: '', onConfirm: () => {} })
  }

  const handleAutoAssign = () => {
    if (!selectedProjectId) return
    const project = projects.find(p => p.id === selectedProjectId)
    const autoMember = getAutoAssignMember(project?.teamId || '')
    
    if (autoMember) {
      taskForm.setValue('assignedMemberId', autoMember.id)
    }
  }

  const projectNeedsReassignment = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    return projectTasks.some(task => {
      const assignee = teams.flatMap(t => t.members).find(m => m.id === task.assignedMemberId)
      if (!assignee) return false
      const memberTaskCount = tasks.filter(t => t.assignedMemberId === task.assignedMemberId).length
      return memberTaskCount > assignee.capacity
    })
  }

  const handleProjectReassign = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    const team = teams.find(t => t.id === project?.teamId)
    if (!team) return

    const projectTasks = tasks.filter(t => t.projectId === projectId)
    const reassignments: any[] = []

    projectTasks.forEach(task => {
      const assignee = team.members.find(m => m.id === task.assignedMemberId)
      if (assignee) {
        const memberTasks = tasks.filter(t => t.assignedMemberId === assignee.id && t.status !== 'Done')
        if (memberTasks.length > assignee.capacity && task.priority !== 'High') {
          const availableMember = team.members.find(m => {
            const mTasks = tasks.filter(t => t.assignedMemberId === m.id && t.status !== 'Done')
            return mTasks.length < m.capacity && m.id !== assignee.id
          })
          if (availableMember) {
            reassignments.push({
              taskId: task.id,
              oldAssigneeId: assignee.id,
              oldAssigneeName: assignee.name,
              newAssigneeId: availableMember.id,
              newAssigneeName: availableMember.name,
            })
          }
        }
      }
    })

    if (reassignments.length > 0) {
      reassignments.forEach(r => {
        dispatch(reassignTask({ id: r.taskId, newAssigneeId: r.newAssigneeId }))
        dispatch(addActivityLog({
          timestamp: new Date().toISOString(),
          taskName: projectTasks.find(t => t.id === r.taskId)?.title || 'Task',
          oldAssignee: r.oldAssigneeName,
          newAssignee: r.newAssigneeName,
          userId: 'current-user',
        }))
      })
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={openProject} onOpenChange={setOpenProject}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Create Project</Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={projectForm.handleSubmit(onCreateProject)} className="space-y-4">
            <Input {...projectForm.register('name')} placeholder="Project name" />
            <Select value={projectForm.watch('teamId') || ''} onValueChange={(value) => projectForm.setValue('teamId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">Create Project</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {projects.map(project => {
          const team = teams.find(t => t.id === project.teamId)
          const projectTasks = tasks.filter(t => t.projectId === project.id)
          const needsReassignment = projectNeedsReassignment(project.id)

          return (
            <Card key={project.id} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{team?.name} • {projectTasks.length} tasks</p>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Button 
                    size="sm"
                    variant={needsReassignment ? 'default' : 'outline'}
                    onClick={() => handleProjectReassign(project.id)}
                    className={`gap-1 flex-1 sm:flex-none ${needsReassignment ? 'animate-blink' : ''}`}
                    title={needsReassignment ? 'Workload needs rebalancing' : 'Workload is balanced'}
                  >
                    {needsReassignment && <AlertCircle className="w-3 h-3 animate-blink flex-shrink-0" />}
                    <Zap className="w-3 h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Reassign</span>
                  </Button>
                  <Dialog open={openTask && selectedProjectId === project.id} onOpenChange={(open) => {
                    if (open) setSelectedProjectId(project.id)
                    setOpenTask(open)
                    if (!open) {
                      setEditingTaskId(null)
                      taskForm.reset()
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none"><Plus className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Task</span></Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-sm">
                      <DialogHeader>
                        <DialogTitle>{editingTaskId ? 'Edit' : 'Add'} Task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={taskForm.handleSubmit(onSaveTask)} className="space-y-4">
                        <Input {...taskForm.register('title')} placeholder="Task title" />
                        <Input {...taskForm.register('description')} placeholder="Description" />
                        <Select value={taskForm.watch('priority')} onValueChange={(value) => taskForm.setValue('priority', value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={taskForm.watch('status')} onValueChange={(value) => taskForm.setValue('status', value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                            <label className="text-sm font-medium">Assign to</label>
                            <Button type="button" size="sm" variant="ghost" onClick={handleAutoAssign} className="text-xs w-full sm:w-auto">
                              Auto-assign
                            </Button>
                          </div>
                          <Select 
                            value={taskForm.watch('assignedMemberId') || 'unassigned'} 
                            onValueChange={(value) => taskForm.setValue('assignedMemberId', value === 'unassigned' ? undefined : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {team?.members.map(member => {
                                const memberTaskCount = tasks.filter(t => t.assignedMemberId === member.id).length
                                const isOverCapacity = memberTaskCount >= member.capacity
                                return (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} ({memberTaskCount}/{member.capacity}){isOverCapacity ? ' ⚠️' : ''}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button type="submit" className="w-full">{editingTaskId ? 'Update' : 'Add'} Task</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch(deleteProject(project.id))}
                    className="gap-1 text-destructive flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3 h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks yet</p>
                ) : (
                  projectTasks.map(task => {
                    const assignee = team?.members.find(m => m.id === task.assignedMemberId)
                    const memberTasks = tasks.filter(t => t.assignedMemberId === task.assignedMemberId)
                    const isOverloaded = assignee && memberTasks.length > assignee.capacity
                    
                    return (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-2 bg-secondary/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignee ? (
                              <span className={isOverloaded ? 'text-destructive font-semibold' : ''}>
                                {assignee.name} ({memberTasks.length}/{assignee.capacity})
                              </span>
                            ) : (
                              'Unassigned'
                            )} • {task.priority}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedProjectId(project.id)
                              setEditingTaskId(task.id)
                              taskForm.reset(task)
                              setOpenTask(true)
                            }}
                            className="gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dispatch(deleteTask(task.id))}
                            className="gap-1 text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={capacityWarning.show} onOpenChange={(open) => {
        if (!open) setCapacityWarning({ show: false, message: '', onConfirm: () => {} })
      }}>
        <AlertDialogContent className="w-full max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Over Capacity Warning</AlertDialogTitle>
            <AlertDialogDescription>{capacityWarning.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Choose Another</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              capacityWarning.onConfirm()
              setCapacityWarning({ show: false, message: '', onConfirm: () => {} })
            }} className="bg-destructive w-full sm:w-auto">
              Assign Anyway
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
