"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2, Zap, AlertCircle, Briefcase, Users, CheckCircle2, Clock, ListTodo } from "lucide-react";
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/redux/api/projectApi";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReassignTaskMutation,
} from "@/redux/api/tasksApi";
import { useGetTeamsQuery } from "@/redux/api/teamApi";
import { toast } from "sonner";
import ProjectTaskCard from "./project-taskCard";

const projectSchema = z.object({
  name: z.string().min(1, "Project name required"),
  description: z.string().min(1, "Description required"),
  assignedTeam: z.string().min(1, "Team required"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  project: z.string().min(1, "Project required"),
  assignedMember: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Done"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type TaskFormData = z.infer<typeof taskSchema>;

export function ProjectManager() {
  // RTK Query hooks
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({
    page: 1,
    limit: 100,
    searchTerm: "",
  });
  const { data: projectsData, isLoading: projectsLoading } =
    useGetProjectsQuery({ page: 1, limit: 100, searchTerm: "" });
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({
    page: 1,
    limit: 100,
    searchTerm: "",
  });

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [createTask] = useCreateTaskMutation();
  const [updateTask, {error}] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [reassignTask] = useReassignTaskMutation();

  console.log(error)

  // Extract data from API responses
  const teams = teamsData?.data || [];
  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  const [openProject, setOpenProject] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    message: "",
    onConfirm: () => {},
  });

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      assignedTeam: "",
    },
  });

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      project: "",
      priority: "Low",
      status: "Pending",
      assignedMember: undefined,
    },
  });

  // Update task form project field when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      taskForm.setValue("project", selectedProjectId);
    }
  }, [selectedProjectId, taskForm]);

  const onCreateProject = async (data: ProjectFormData) => {
    try {
      await createProject(data).unwrap();
      toast.success("Project created successfully");
      projectForm.reset();
      setOpenProject(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  const getAutoAssignMember = (teamId: string) => {
    const team = teams.find((t: any) => t._id === teamId);
    if (!team || !team.members || team.members.length === 0) return null;

    let memberWithLeastTasks = team.members[0];
    let minTasks = tasks.filter(
      (t: any) => t.assignedMember?._id === memberWithLeastTasks?._id
    ).length;

    team.members.forEach((member: any) => {
      const memberTasks = tasks.filter(
        (t: any) => t.assignedMember?._id === member._id
      );
      if (memberTasks.length < minTasks) {
        memberWithLeastTasks = member;
        minTasks = memberTasks.length;
      }
    });

    return memberWithLeastTasks;
  };

  const onSaveTask = (data: TaskFormData) => {
    if (!selectedProjectId) return;

    const project = projects.find((p: any) => p._id === selectedProjectId);
    const team = teams.find((t: any) => t._id === project?.assignedTeam?._id);

    if (data.assignedMember && !editingTaskId) {
      const assignee = team?.members?.find(
        (m: any) => m._id === data.assignedMember
      );
      const memberTaskCount = tasks.filter(
        (t: any) => t.assignedMember?._id === data.assignedMember
      ).length;

      if (assignee && memberTaskCount >= assignee.capacity) {
        setCapacityWarning({
          show: true,
          message: `${assignee.name} has ${memberTaskCount} tasks but capacity is ${assignee.capacity}. Assign anyway?`,
          onConfirm: () => commitTaskSave(data, project, team, assignee),
        });
        return;
      }
    }

    commitTaskSave(data, project, team);
  };

  const commitTaskSave = async (
    data: TaskFormData,
    project: any,
    team: any,
    oldAssignee?: any
  ) => {
    if (!selectedProjectId) return;
    const autoReassignEnabled = localStorage.getItem('autoReassignEnabled') === 'true';

    try {
      if (editingTaskId) {
        const oldTask = tasks.find((t: any) => t._id === editingTaskId);
        const updateData: any = {
          taskId: editingTaskId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
        };

        if (data.assignedMember) {
          updateData.assignedMember = data.assignedMember;
        }

        await updateTask(updateData).unwrap();
        toast.success("Task updated successfully");

        // Log activity if assignee changed
        if (oldTask && oldTask.assignedMember?._id !== data.assignedMember) {
          const oldAssigneeName = oldTask.assignedMember?.name || "Unassigned";
          const newAssigneeName =
            team?.members?.find((m: any) => m._id === data.assignedMember)
              ?.name || "Unassigned";

          console.log("Task reassigned:", { oldAssigneeName, newAssigneeName });
        }
      } else {
        const taskData: any = {
          title: data.title,
          description: data.description,
          project: selectedProjectId,
          priority: data.priority,
          status: data.status,
          autoReassignEnabled,
        };

        if (data.assignedMember) {
          taskData.assignedMember = data.assignedMember;
        }

        await createTask(taskData).unwrap();
        toast.success("Task created successfully");
      }

      taskForm.reset({
        title: "",
        description: "",
        project: selectedProjectId,
        priority: "Low",
        status: "Pending",
        assignedMember: undefined,
      });
      setOpenTask(false);
      setEditingTaskId(null);
      setCapacityWarning({ show: false, message: "", onConfirm: () => {} });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save task");
    }
  };

  const handleAutoAssign = () => {
    if (!selectedProjectId) return;
    const project = projects.find((p: any) => p._id === selectedProjectId);
    const autoMember = getAutoAssignMember(project?.assignedTeam?._id || "");

    if (autoMember) {
      taskForm.setValue("assignedMember", autoMember._id);
    }
  };

  const projectNeedsReassignment = (projectId: string) => {
    const projectTasks = tasks.filter((t: any) => t.project?._id === projectId);
    return projectTasks.some((task: any) => {
      return task.assignedMember?.overloaded === true;
    });
  };

  const handleProjectReassign = async (teamId: string) => {
    await reassignTask({ teamId });
  };

  if (teamsLoading || projectsLoading || tasksLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Project Management</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Organize projects and track task progress
          </p>
        </div>
        <Dialog open={openProject} onOpenChange={setOpenProject}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={projectForm.handleSubmit(onCreateProject)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                {...projectForm.register("name")}
                placeholder="Enter project name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                {...projectForm.register("description")}
                placeholder="Brief project description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Team</label>
              <Select
                value={projectForm.watch("assignedTeam") || ""}
                onValueChange={(value) =>
                  projectForm.setValue("assignedTeam", value)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team: any) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-10">
              Create Project
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Briefcase className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No projects yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create your first project to start organizing tasks and tracking progress.
              </p>
            </div>
            <Button onClick={() => setOpenProject(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Your First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project: any) => {
          const team = teams.find(
            (t: any) => t._id === project.assignedTeam?._id
          );
          const projectTasks = project.tasks || [];
          const needsReassignment = projectNeedsReassignment(project._id);
          const completedTasks = projectTasks.filter((t: any) => t.status === 'Done').length;
          const inProgressTasks = projectTasks.filter((t: any) => t.status === 'In Progress').length;
          const pendingTasks = projectTasks.filter((t: any) => t.status === 'Pending').length;
          const completionRate = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

          return (
            <Card key={project._id} className="p-6 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50">
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold">{project.name}</h3>
                      <Badge variant="secondary" className="gap-1.5">
                        <Users className="w-3 h-3" />
                        {project.assignedTeam?.name || "No Team"}
                      </Badge>
                      {needsReassignment && (
                        <Badge variant="destructive" className="gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Needs Rebalancing
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Total Tasks</p>
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold">{projectTasks.length}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Completed</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-green-600">{completedTasks}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">In Progress</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-blue-600">{inProgressTasks}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Progress</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={completionRate >= 70 ? "default" : completionRate >= 40 ? "secondary" : "outline"}>
                        {completionRate}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {projectTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-green-500 transition-all" 
                          style={{width: `${(completedTasks / projectTasks.length) * 100}%`}}
                        />
                        <div 
                          className="bg-blue-500 transition-all" 
                          style={{width: `${(inProgressTasks / projectTasks.length) * 100}%`}}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" /> Done
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" /> In Progress
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-secondary rounded-full" /> Pending
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button
                    size="sm"
                    variant={needsReassignment ? "default" : "outline"}
                    onClick={() => handleProjectReassign(project.assignedTeam?._id)}
                    className={`gap-2 cursor-pointer shadow-sm ${
                      needsReassignment ? "animate-pulse" : ""
                    }`}
                    title={
                      needsReassignment
                        ? "Workload needs rebalancing"
                        : "Workload is balanced"
                    }
                  >
                    <Zap className="w-4 h-4" />
                    <span>Reassign Tasks</span>
                  </Button>
                  <Dialog
                    open={openTask && selectedProjectId === project._id}
                    onOpenChange={(open) => {
                      if (open) setSelectedProjectId(project._id);
                      setOpenTask(open);
                      if (!open) {
                        setEditingTaskId(null);
                        taskForm.reset({
                          title: "",
                          description: "",
                          project: project._id,
                          priority: "Low",
                          status: "Pending",
                          assignedMember: undefined,
                        });
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTaskId ? "Edit" : "Add"} Task
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={taskForm.handleSubmit(onSaveTask)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Task Title</label>
                          <Input
                            {...taskForm.register("title")}
                            placeholder="Enter task title"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            {...taskForm.register("description")}
                            placeholder="Describe the task"
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select
                              value={taskForm.watch("priority")}
                              onValueChange={(value) =>
                                taskForm.setValue("priority", value as any)
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                              value={taskForm.watch("status")}
                              onValueChange={(value) =>
                                taskForm.setValue("status", value as any)
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Assign Member</label>
                          <div className="flex gap-2">
                            <Select
                              value={
                                taskForm.watch("assignedMember") || "unassigned"
                              }
                              onValueChange={(value) =>
                                taskForm.setValue(
                                  "assignedMember",
                                  value === "unassigned" ? undefined : value
                                )
                              }
                            >
                              <SelectTrigger className="flex-1 h-10">
                                <SelectValue placeholder="Select member (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  Unassigned
                                </SelectItem>
                                {team?.members?.map((member: any) => {
                                  const memberTaskCount = tasks.filter(
                                    (t: any) =>
                                      t.assignedMember?._id === member._id
                                  ).length;
                                  return (
                                    <SelectItem
                                      key={member._id}
                                      value={member._id}
                                    >
                                      {member.name} ({member.role}) -{" "}
                                      {memberTaskCount}/{member.capacity}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAutoAssign}
                              title="Auto-assign to member with least tasks"
                              className="h-10 w-10 p-0"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-10">
                          {editingTaskId ? "Update" : "Create"} Task
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await deleteProject(project._id).unwrap();
                        toast.success("Project deleted successfully");
                      } catch (error: any) {
                        toast.error(
                          error?.data?.message || "Failed to delete project"
                        );
                      }
                    }}
                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>

              {/* Tasks Section */}
              <div className="space-y-2 mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">TASKS</h4>
                </div>
                {projectTasks.length === 0 ? (
                  <div className="text-center py-8 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">No tasks yet. Click "Add Task" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectTasks.map((task: any) => {
                    return (
                      <ProjectTaskCard
                        key={task._id}
                        task={task}
                        setEditingTaskId={setEditingTaskId}
                        setSelectedProjectId={setSelectedProjectId}
                        project={project}
                        taskForm={taskForm}
                        setOpenTask={setOpenTask}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                      />
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      <AlertDialog
        open={capacityWarning.show}
        onOpenChange={(open) => {
          if (!open)
            setCapacityWarning({
              show: false,
              message: "",
              onConfirm: () => {},
            });
        }}
      >
        <AlertDialogContent className="w-full max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Over Capacity Warning</AlertDialogTitle>
            <AlertDialogDescription>
              {capacityWarning.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Choose Another
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                capacityWarning.onConfirm();
                setCapacityWarning({
                  show: false,
                  message: "",
                  onConfirm: () => {},
                });
              }}
              className="bg-destructive w-full sm:w-auto"
            >
              Assign Anyway
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
