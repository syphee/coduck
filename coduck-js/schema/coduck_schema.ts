import { z } from "zod";

// task schema for coduck
const TaskItem = z.object({
  title: z.string().describe("A specific, actionable subtask title"),
  steps: z.array(z.string()).describe(
    "bite-sized, concrete step(s) to actually complete this subtask"
  ),
  exit_criteria: z.string().describe(
    "A single clear, checkable statement of what 'done' looks like for this subtask"
  ),
  task_deadline: z.string().nullable().describe(
    "YYYY-MM-DD. Realistic for the effort in 'steps', and on or before the project deadline. null if the user gave no deadline"
  ),
});

const taskQuerySchema = z.object({
  intent: z.enum(["create", "update", "none"]),
  project: z.string().nullable(),
  project_goal: z.string().nullable(),
  project_deadline: z.string().nullable().describe(
    "The user's stated deadline for the overall project goal, resolved to YYYY-MM-DD, or null if none was given"
  ),
  deadline_warning: z.string().nullable().optional().describe(
    "Only if the user's deadline is unrealistic for the work; otherwise null"
  ),
  tasks: z.array(TaskItem).default([]),
  updates: z.array(z.object({
    task_id: z.string(),
    new_status: z.string().nullable().optional(),
    new_title: z.string().nullable().optional(),
    new_deadline: z.string().nullable().optional(),
  })).default([]),
}).superRefine((data, ctx) => {
  // Runs in your app only (not sent to the model).
  const t = (d?: string | null) => (d ? Date.parse(d) : null);
  const projectDl = t(data.project_deadline);
  if (projectDl === null) return;

  data.tasks.forEach((task, i) => {
    const taskDl = t(task.task_deadline);
    if (taskDl !== null && taskDl > projectDl) {
      ctx.addIssue({
        code: "custom",
        path: ["tasks", i, "deadline"],
        message: "Task deadline is after the project deadline",
      });
    }
  });
});

export { taskQuerySchema };