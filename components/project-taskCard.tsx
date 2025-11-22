import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit2, Trash2, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ProjectTaskCardProps {
  task: any;
  setEditingTaskId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  project: any;
  taskForm: any;
  setOpenTask: (open: boolean) => void;
  deleteTask: (id: string) => Promise<any>;
  updateTask?: (data: any) => Promise<any>;
}

const ProjectTaskCard = ({
  task,
  setEditingTaskId,
  setSelectedProjectId,
  project,
  taskForm,
  setOpenTask,
  deleteTask,
  updateTask,
}: ProjectTaskCardProps) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!updateTask) return;
    console.log(task._id)
    
    setIsUpdating(true);
    try {
      await updateTask({
        taskId: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        assignedMember: task.assignedMember?._id,
      })
      toast.success("Task status updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "Pending":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div
      className="group relative p-4 bg-linear-to-br from-secondary/30 to-secondary/10 rounded-lg hover:from-secondary/50 hover:to-secondary/20 transition-all duration-200 border border-secondary/20 hover:border-secondary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h5 className="font-semibold text-sm flex-1 min-w-0">{task.title}</h5>
            {task.assignedMember?.overloaded && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                Overloaded
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
              {task.priority}
            </Badge>
            
            {/* Status Dropdown for Quick Update */}
            <Select 
              value={task.status} 
              onValueChange={handleStatusChange}
              disabled={isUpdating || !updateTask}
            >
              <SelectTrigger className={`h-6 text-xs px-2 border ${getStatusColor(task.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{task.assignedMember?.name || "Unassigned"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1">
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
            className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <Edit2 className="w-3.5 h-3.5" />
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
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskCard;
