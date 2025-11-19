"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Plus, Trash2, Edit2, Zap, AlertCircle } from "lucide-react";
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
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [reassignTask, {error}] = useReassignTaskMutation();

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
    <div className="space-y-4">
      <Dialog open={openProject} onOpenChange={setOpenProject}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Create Project
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={projectForm.handleSubmit(onCreateProject)}
            className="space-y-4"
          >
            <Input
              {...projectForm.register("name")}
              placeholder="Project name"
            />
            <Input
              {...projectForm.register("description")}
              placeholder="Project description"
            />
            <Select
              value={projectForm.watch("assignedTeam") || ""}
              onValueChange={(value) =>
                projectForm.setValue("assignedTeam", value)
              }
            >
              <SelectTrigger>
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
            <Button type="submit" className="w-full">
              Create Project
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {projects.map((project: any) => {
          const team = teams.find(
            (t: any) => t._id === project.assignedTeam?._id
          );
          const projectTasks = project.tasks || [];
          const needsReassignment = projectNeedsReassignment(project._id);

          return (
            <Card key={project._id} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {project.assignedTeam?.name || "No Team"} •{" "}
                    {projectTasks.length} tasks
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Button
                    size="sm"
                    variant={needsReassignment ? "default" : "outline"}
                    onClick={() => handleProjectReassign(project.assignedTeam?._id)}
                    className={`gap-1 flex-1 sm:flex-none ${
                      needsReassignment ? "animate-blink" : ""
                    }`}
                    title={
                      needsReassignment
                        ? "Workload needs rebalancing"
                        : "Workload is balanced"
                    }
                  >
                    {needsReassignment && (
                      <AlertCircle className="w-3 h-3 animate-blink flex-shrink-0" />
                    )}
                    <Zap className="w-3 h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Reassign</span>
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
                        className="gap-1 flex-1 sm:flex-none"
                      >
                        <Plus className="w-3 h-3 flex-shrink-0" />{" "}
                        <span className="hidden sm:inline">Task</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTaskId ? "Edit" : "Add"} Task
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={taskForm.handleSubmit(onSaveTask)}
                        className="space-y-4"
                      >
                        <Input
                          {...taskForm.register("title")}
                          placeholder="Task title"
                        />
                        <textarea
                          {...taskForm.register("description")}
                          placeholder="Task description"
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <Select
                          value={taskForm.watch("priority")}
                          onValueChange={(value) =>
                            taskForm.setValue("priority", value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={taskForm.watch("status")}
                          onValueChange={(value) =>
                            taskForm.setValue("status", value as any)
                          }
                        >
                          <SelectTrigger>
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

                        <div className="space-y-2">
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
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Assign to member (optional)" />
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
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full">
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
                  projectTasks.map((task: any) => {
                    // const assignee = team?.members?.find(
                    //   (m: any) => m._id === task.assignedMember?._id
                    // );
                    // const memberTasks = tasks.filter(
                    //   (t: any) =>
                    //     t.assignedMember?._id === task.assignedMember?._id
                    // );
                    // const isOverloaded =
                    //   assignee && memberTasks.length > assignee.capacity;

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
                      />
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>

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
