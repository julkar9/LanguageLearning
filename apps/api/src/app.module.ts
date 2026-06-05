import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";
import { StudyController } from "./study/study.controller";
import { StudyService } from "./study/study.service";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [HealthController, TasksController, StudyController],
  providers: [PrismaService, TasksService, StudyService]
})
export class AppModule {}
