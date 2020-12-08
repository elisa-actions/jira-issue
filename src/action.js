const core = require("@actions/core");
const { context } = require("@actions/github");
const { createIssue } = require("./create-issue");
const { resolveIssue } = require("./resolve-issue");

exports.run = async function () {
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
};
