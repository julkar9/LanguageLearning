import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TasksClient } from "../../features/tasks/tasks-client";

const initialTask = {
  id: "task-1",
  title: "Learn pnpm workspaces",
  done: false,
  createdAt: "2026-06-05T00:00:00.000Z",
  updatedAt: "2026-06-05T00:00:00.000Z"
};

describe("TasksClient", () => {
  beforeEach(() => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";

      if (url.endsWith("/tasks") && method === "GET") {
        return Promise.resolve(jsonResponse([initialTask]));
      }

      if (url.endsWith("/tasks") && method === "POST") {
        return Promise.resolve(
          jsonResponse(
            {
              ...initialTask,
              id: "task-2",
              title: "Review Prisma seed"
            },
            201
          )
        );
      }

      if (url.endsWith("/tasks/task-1") && method === "PATCH") {
        return Promise.resolve(
          jsonResponse({
            ...initialTask,
            done: true
          })
        );
      }

      if (url.endsWith("/tasks/task-1") && method === "DELETE") {
        return Promise.resolve(new Response(null, { status: 204 }));
      }

      return Promise.resolve(jsonResponse({ message: `Unexpected request: ${method} ${url}` }, 500));
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads tasks and creates a task through the ts-rest React Query client", async () => {
    renderWithQueryClient(<TasksClient />);

    expect(await screen.findByText("Learn pnpm workspaces")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Task title"), "Review Prisma seed");
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/tasks$/),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

function renderWithQueryClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}
