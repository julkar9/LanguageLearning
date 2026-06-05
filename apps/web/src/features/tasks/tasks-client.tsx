"use client";

import type { Task } from "@language-learning/api-contract";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@language-learning/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { tsr } from "@/lib/api";

export function TasksClient() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const tasksQuery = tsr.tasks.listTasks.useQuery({
    queryKey: ["tasks"]
  });

  const refreshTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createTask = tsr.tasks.createTask.useMutation({
    onSuccess: async () => {
      setTitle("");
      await refreshTasks();
    }
  });

  const updateTask = tsr.tasks.updateTask.useMutation({
    onSuccess: refreshTasks
  });

  const deleteTask = tsr.tasks.deleteTask.useMutation({
    onSuccess: refreshTasks
  });

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length === 0 || createTask.isPending) {
      return;
    }
    createTask.mutate({ body: { title } });
  }

  const tasks = tasksQuery.data?.body ?? [];
  const mutationError = createTask.error || updateTask.error || deleteTask.error;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Local tasks</p>
          <h1 className="text-3xl font-bold tracking-normal">Tasks</h1>
        </div>
        <Button asChild variant="outline">
          <a href="/study">Study cockpit</a>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create task</CardTitle>
          <CardDescription>Add a task to the local queue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitTask}>
            <Input
              aria-label="Task title"
              placeholder="Example: Review the Prisma schema"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Button className="shrink-0" disabled={title.trim().length === 0 || createTask.isPending} type="submit">
              {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Task list</CardTitle>
            <CardDescription>Current local task rows.</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => void refreshTasks()} aria-label="Refresh tasks">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasksQuery.isPending ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading tasks...
            </div>
          ) : null}

          {tasksQuery.error ? <ErrorState message="Could not load tasks from the API." /> : null}
          {mutationError ? <ErrorState message="Could not save the task change." /> : null}

          {!tasksQuery.isPending && tasks.length === 0 ? (
            <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">No tasks yet.</div>
          ) : null}

          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onDelete={(id) => deleteTask.mutate({ params: { id } })}
              onToggle={(nextTask) => updateTask.mutate({ params: { id: nextTask.id }, body: { done: !nextTask.done } })}
              onRename={(id, nextTitle) => updateTask.mutate({ params: { id }, body: { title: nextTitle } })}
              saving={updateTask.isPending || deleteTask.isPending}
            />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function TaskRow({
  onDelete,
  onRename,
  onToggle,
  saving,
  task
}: {
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onToggle: (task: Task) => void;
  saving: boolean;
  task: Task;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  function saveRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = draftTitle.trim();
    if (nextTitle.length === 0) {
      return;
    }
    onRename(task.id, nextTitle);
    setEditing(false);
  }

  return (
    <article className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center">
      <button
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
        onClick={() => onToggle(task)}
        aria-label={task.done ? "Mark task incomplete" : "Mark task complete"}
        disabled={saving}
      >
        {task.done ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
      </button>

      {editing ? (
        <form className="flex min-w-0 flex-1 gap-2" onSubmit={saveRename}>
          <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} aria-label="Edit task title" />
          <Button disabled={saving || draftTitle.trim().length === 0} type="submit">
            Save
          </Button>
        </form>
      ) : (
        <div className="min-w-0 flex-1">
          <p className={task.done ? "truncate text-sm font-semibold text-muted-foreground line-through" : "truncate text-sm font-semibold"}>
            {task.title}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Updated {formatDate(task.updatedAt)}</p>
        </div>
      )}

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="icon" onClick={() => setEditing((value) => !value)} aria-label="Edit task" disabled={saving}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(task.id)} aria-label="Delete task" disabled={saving}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-destructive bg-background p-4 text-sm text-destructive">{message}</div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
