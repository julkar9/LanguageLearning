export { z } from "zod";
export * from "./resources/study";
export * from "./resources/tasks";

import { initContract } from "@ts-rest/core";
import { studyContract } from "./resources/study";
import { taskContract } from "./resources/tasks";

const c = initContract();

export const apiContract = c.router({
  tasks: taskContract,
  study: studyContract
});
