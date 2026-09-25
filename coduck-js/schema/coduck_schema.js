import { z } from "zod";

// task schema for coduck
const TaskItem = z.object({
  title: z.string().describe("A specific, actionable subtask title"),
  steps: z.array(z.string()).describe(
    "2-5 bite-sized, concrete steps to actually complete this subtask"
  ),
  exit_criteria: z.string().describe(
    "A single clear, checkable statement of what 'done' looks like for this subtask"
  ),
});
const taskQuerySchema = z.object({
  intent: z.enum(["create", "update", "none"]),
  project: z.string().nullable(),
  tasks: z.array(TaskItem).default([]),
  updates: z.array(z.object({
    task_id: z.string(),
    new_status: z.string().nullable().optional(),
    new_title: z.string().nullable().optional(),
  })).default([]),
});

export { taskQuerySchema };