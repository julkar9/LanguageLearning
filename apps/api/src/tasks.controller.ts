import { taskContract } from "@language-learning/api-contract";
import { Controller, Inject } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { TasksService } from "./tasks.service";

@Controller()
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasksService: TasksService) {}

  @TsRestHandler(taskContract.listTasks)
  listTasks() {
    const tasksService = this.tasksService;
    return tsRestHandler(taskContract.listTasks, async () => ({
        status: 200,
        body: await tasksService.list()
      }));
  }

  @TsRestHandler(taskContract.createTask)
  createTask() {
    const tasksService = this.tasksService;
    return tsRestHandler(taskContract.createTask, async ({ body }) => ({
        status: 201,
        body: await tasksService.create(body.title)
      }));
  }

  @TsRestHandler(taskContract.updateTask)
  updateTask() {
    const tasksService = this.tasksService;
    return tsRestHandler(taskContract.updateTask, async ({ params, body }) => {
        const task = await tasksService.update(params.id, body);

        if (!task) {
          return {
            status: 404,
            body: { message: "Task not found." }
          };
        }

        return {
          status: 200,
          body: task
        };
      });
  }

  @TsRestHandler(taskContract.deleteTask)
  deleteTask() {
    const tasksService = this.tasksService;
    return tsRestHandler(taskContract.deleteTask, async ({ params }) => {
        const deleted = await tasksService.delete(params.id);

        if (!deleted) {
          return {
            status: 404,
            body: { message: "Task not found." }
          };
        }

        return {
          status: 204,
          body: undefined
        };
      });
  }
}
