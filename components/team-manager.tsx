"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createTeam,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useCreateTeamMutation, useDeleteTeamMutation, useGetTeamsQuery } from "@/redux/api/teamApi";
import { toast } from "sonner";
import {
  useCreateMemberMutation,
  useDeleteMemberMutation,
  useUpdateMemberMutation,
} from "@/redux/api/membersApi";

const teamSchema = z.object({
  name: z.string().min(1, "Team name required"),
});

const memberSchema = z.object({
  name: z.string().min(1, "Name required"),
  role: z.string().min(1, "Role required"),
  capacity: z.number().min(0).max(10),
});

type TeamFormData = z.infer<typeof teamSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export function TeamManager() {
  const [openTeam, setOpenTeam] = useState(false);
  const [openMember, setOpenMember] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const { data: teamsData } = useGetTeamsQuery({});
  const [createTeam] = useCreateTeamMutation();
  const [createMember] = useCreateMemberMutation();
  const [updateMember, { error: updateMemberError, data: updateMemberData }] =
    useUpdateMemberMutation();
  const [memberDelete] = useDeleteMemberMutation();
  const [teamDelete] = useDeleteTeamMutation()
  // const {data: membersData } = useGetTeamsQuery({});
  console.log(updateMemberError);
  console.log("update member data", updateMemberData);

  const teams1 = teamsData?.data || [];
  // const members1 = membersData?.data || [];
  // console.log("members1", members1);
  console.log(teams1);

  const teamForm = useForm<TeamFormData>({ resolver: zodResolver(teamSchema) });
  const memberForm = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  const onCreateTeam = async (data: TeamFormData) => {
    await createTeam({ name: data.name, userId: "current-user" });
    // dispatch(createTeam({ name: data.name, userId: 'current-user' }))
    toast.success("Team created successfully");
    teamForm.reset();
    setOpenTeam(false);
  };

  const onAddMember = async (data: MemberFormData) => {
    if (!selectedTeamId) return;
    console.log("selectedTeamId", selectedTeamId);

    if (editingMemberId) {
      await updateMember({
        memberId: editingMemberId,
        team: selectedTeamId,
        name: data.name,
        role: data.role,
        capacity: data.capacity,
      });
      setEditingMemberId(null);
    } else {
      await createMember({
        team: selectedTeamId,
        name: data.name,
        role: data.role,
        capacity: data.capacity,
      });
    }
    memberForm.reset();
    setOpenMember(false);
  };

  const onDeleteMember = async (memberId: string) => {
    try {
      await memberDelete({ memberId }).unwrap();
      toast.success("Member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete member");
      console.error("Delete error:", error);
    }
  };

  const onDeleteTeam = async (teamId: string) => {
    try {
      await teamDelete({ teamId }).unwrap();
      toast.success("Team deleted successfully");
    } catch (error) {
      toast.error("Failed to delete team");
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your teams and members</p>
        </div>
        <Dialog open={openTeam} onOpenChange={setOpenTeam}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={teamForm.handleSubmit(onCreateTeam)}
              className="space-y-4"
            >
              <Input {...teamForm.register("name")} placeholder="Enter team name" className="h-10" />
              <Button type="submit" className="w-full h-10">
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams1?.map((team: any) => (
          <Card key={team._id} className="p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h3 className="text-lg font-bold">{team.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog
                  open={openMember && selectedTeamId === team._id}
                  onOpenChange={(open) => {
                    if (open) setSelectedTeamId(team._id);
                    setOpenMember(open);
                    if (!open) setEditingMemberId(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-9 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMemberId ? "Edit" : "Add"} Team Member
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={memberForm.handleSubmit(onAddMember)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          {...memberForm.register("name")}
                          placeholder="Enter member name"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Input
                          {...memberForm.register("role")}
                          placeholder="e.g., Developer, Designer"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Capacity</label>
                        <Input
                          {...memberForm.register("capacity", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="0-10"
                          className="h-10"
                        />
                      </div>
                      <Button type="submit" className="w-full h-10">
                        {editingMemberId ? "Update" : "Add"} Member
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteTeam(team._id)}
                  className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              {team.members.map((member: any) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3.5 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-all border border-transparent hover:border-secondary"
                >
                  <div className="flex-1 space-y-1.5">
                    <p className="font-semibold text-base">{member.name}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">Role:</span> {member.role}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">Capacity:</span> {member.capacity}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">Assigned:</span> {member.totalTasks}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">Completed:</span> {member.tasksCompleted}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTeamId(team._id);
                        setEditingMemberId(member._id);
                        memberForm.reset({
                          name: member.name,
                          role: member.role,
                          capacity: member.capacity,
                        });
                        setOpenMember(true);
                      }}
                      className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteMember(member._id)}
                      className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
