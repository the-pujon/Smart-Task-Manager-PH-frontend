'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { createTeam, addTeamMember, editTeamMember, deleteTeamMember } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Edit2 } from 'lucide-react'

const teamSchema = z.object({
  name: z.string().min(1, 'Team name required'),
})

const memberSchema = z.object({
  name: z.string().min(1, 'Name required'),
  role: z.string().min(1, 'Role required'),
  capacity: z.number().min(0).max(10),
})

type TeamFormData = z.infer<typeof teamSchema>
type MemberFormData = z.infer<typeof memberSchema>

export function TeamManager() {
  const dispatch = useAppDispatch()
  const teams = useAppSelector(state => state.teams.teams)
  const [openTeam, setOpenTeam] = useState(false)
  const [openMember, setOpenMember] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

  const teamForm = useForm<TeamFormData>({ resolver: zodResolver(teamSchema) })
  const memberForm = useForm<MemberFormData>({ resolver: zodResolver(memberSchema) })

  const onCreateTeam = (data: TeamFormData) => {
    dispatch(createTeam({ name: data.name, userId: 'current-user' }))
    teamForm.reset()
    setOpenTeam(false)
  }

  const onAddMember = (data: MemberFormData) => {
    if (!selectedTeamId) return
    const memberId = editingMemberId || Date.now().toString()
    
    if (editingMemberId) {
      dispatch(editTeamMember({ teamId: selectedTeamId, memberId, updates: { ...data, id: memberId } }))
      setEditingMemberId(null)
    } else {
      dispatch(addTeamMember({
        teamId: selectedTeamId,
        member: { id: memberId, ...data },
      }))
    }
    memberForm.reset()
    setOpenMember(false)
  }

  return (
    <div className="space-y-4">
      <Dialog open={openTeam} onOpenChange={setOpenTeam}>
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Create Team</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={teamForm.handleSubmit(onCreateTeam)} className="space-y-4">
            <Input {...teamForm.register('name')} placeholder="Team name" />
            <Button type="submit" className="w-full">Create Team</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {teams.map(team => (
          <Card key={team.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{team.name}</h3>
              <Dialog open={openMember && selectedTeamId === team.id} onOpenChange={(open) => {
                if (open) setSelectedTeamId(team.id)
                setOpenMember(open)
                if (!open) setEditingMemberId(null)
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" /> Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMemberId ? 'Edit' : 'Add'} Team Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={memberForm.handleSubmit(onAddMember)} className="space-y-4">
                    <Input {...memberForm.register('name')} placeholder="Member name" />
                    <Input {...memberForm.register('role')} placeholder="Role" />
                    <Input {...memberForm.register('capacity', { valueAsNumber: true })} type="number" placeholder="Capacity (0-10)" />
                    <Button type="submit" className="w-full">{editingMemberId ? 'Update' : 'Add'} Member</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {team.members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role} • Capacity: {member.capacity}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTeamId(team.id)
                      setEditingMemberId(member.id)
                      memberForm.reset({ name: member.name, role: member.role, capacity: member.capacity })
                      setOpenMember(true)
                    }}
                    className="gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch(deleteTeamMember({ teamId: team.id, memberId: member.id }))}
                    className="gap-1 text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
