import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("task routes", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, toggles, and deletes a task", async () => {
    const createdResponse = await request(app.getHttpServer())
      .post("/tasks")
      .send({ title: "Learn contract-first APIs" })
      .expect(201);

    expect(createdResponse.body).toMatchObject({
      title: "Learn contract-first APIs",
      done: false
    });

    const taskId = String(createdResponse.body.id);

    const listResponse = await request(app.getHttpServer()).get("/tasks").expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: taskId,
      title: "Learn contract-first APIs"
    });

    const updatedResponse = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ done: true })
      .expect(200);

    expect(updatedResponse.body.done).toBe(true);

    await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(204);
    await request(app.getHttpServer()).get("/tasks").expect(200).expect([]);
  });
});
