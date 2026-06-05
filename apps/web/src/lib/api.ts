import { apiContract } from "@language-learning/api-contract";
import { initTsrReactQuery } from "@ts-rest/react-query/v5";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5174";

export const tsr = initTsrReactQuery(apiContract, {
  baseUrl: apiBaseUrl,
  baseHeaders: {}
});
