import * as core from "@actions/core";
import { context } from "@actions/github";
import { createIssue } from "./create-issue.js";
import { resolveIssue } from "./resolve-issue.js";

export async function run() {
  const action = core.getInput("action") || context.payload.action;
  switch (action) {
    case "create-issue":
      await createIssue();
      break;
    case "resolve-issue":
      await resolveIssue();
      break;
    default:
      core.setFailed(`Invalid action type: ${action}`);
  }
}
