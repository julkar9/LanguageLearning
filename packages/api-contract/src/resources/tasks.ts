import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  done: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160)
});

export const UpdateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    done: z.boolean().optional()
  })
  .refine((body) => body.title !== undefined || body.done !== undefined, {
    message: "At least one task field is required."
  });

export const ErrorSchema = z.object({
  message: z.string()
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;

export const taskContract = c.router({
  listTasks: {
    method: "GET",
    path: "/tasks",
    responses: {
      200: z.array(TaskSchema)
    },
    summary: "List tasks"
  },
  createTask: {
    method: "POST",
    path: "/tasks",
    body: CreateTaskSchema,
    responses: {
      201: TaskSchema,
      400: ErrorSchema
    },
    summary: "Create task"
  },
  updateTask: {
    method: "PATCH",
    path: "/tasks/:id",
    pathParams: z.object({
      id: z.string().min(1)
    }),
    body: UpdateTaskSchema,
    responses: {
      200: TaskSchema,
      404: ErrorSchema
    },
    summary: "Update task"
  },
  deleteTask: {
    method: "DELETE",
    path: "/tasks/:id",
    pathParams: z.object({
      id: z.string().min(1)
    }),
    body: z.undefined(),
    responses: {
      204: z.undefined(),
      404: ErrorSchema
    },
    summary: "Delete task"
  }
});
