import { describe, expect, it } from "vitest";
import { CreateTaskSchema, UpdateTaskSchema } from "./tasks";

describe("task schemas", () => {
  it("trims and accepts a valid task title", () => {
    expect(CreateTaskSchema.parse({ title: "  Read NestJS docs  " })).toEqual({
      title: "Read NestJS docs"
    });
  });

  it("rejects an empty create title", () => {
    expect(() => CreateTaskSchema.parse({ title: "   " })).toThrow("Title is required.");
  });

  it("requires at least one update field", () => {
    expect(() => UpdateTaskSchema.parse({})).toThrow("At least one task field is required.");
  });
});
