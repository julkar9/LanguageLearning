import { Task, UpdateTaskInput } from "@language-learning/api-contract";
import type { Prisma } from "@language-learning/database";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: { createdAt: "asc" }
    });
    return tasks.map(toTask);
  }

  async create(title: string): Promise<Task> {
    const task = await this.prisma.task.create({
      data: { title }
    });
    return toTask(task);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) {
      data.title = input.title;
    }
    if (input.done !== undefined) {
      data.done = input.done;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data
    });
    return toTask(task);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return false;
    }

    await this.prisma.task.delete({ where: { id } });
    return true;
  }
}

function toTask(task: {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Task {
  return {
    id: task.id,
    title: task.title,
    done: task.done,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}
