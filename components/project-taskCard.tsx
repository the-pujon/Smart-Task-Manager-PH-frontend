import React from "react";
import { Button } from "./ui/button";

import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectTaskCardProps {
  task: any;
  setEditingTaskId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  project: any;
  taskForm: any;
  setOpenTask: (open: boolean) => void;
  deleteTask: (id: string) => Promise<any>;
}

const ProjectTaskCard = ({
  task,
  setEditingTaskId,
  setSelectedProjectId,
  project,
  taskForm,
  setOpenTask,
  deleteTask,
}: ProjectTaskCardProps) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-2 bg-secondary/30 rounded-lg"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">
          {task.assignedMember?.name || "Unassigned"}
          {task.assignedMember?.overloaded && " ⚠️"} • {task.priority} •{" "}
          {task.status}
        </p>
      </div>
      {/* <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingTaskId(task._id);
            setSelectedProjectId(project._id);
            taskForm.reset({
              title: task.title,
              description: task.description,
              project: project._id,
              assignedMember: task.assignedMember?._id || undefined,
              priority: task.priority,
              status: task.status,
            });
            setOpenTask(true);
          }}
          className="gap-1"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            try {
              await deleteTask(task._id);
              toast.success("Task deleted successfully");
            } catch (error: any) {
              toast.error(error?.data?.message || "Failed to delete task");
            }
          }}
          className="gap-1 text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div> */}
    </div>
  );
};

export default ProjectTaskCard;
