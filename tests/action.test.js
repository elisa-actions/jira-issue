jest.mock("../src/create-issue");
jest.mock("../src/resolve-issue");
jest.mock("@actions/core");
jest.mock("@actions/github");

const { setInputs } = require("./test-utils");

const core = require("@actions/core");
const { context } = require("@actions/github");
const { run } = require("../src/action");
const { createIssue } = require("../src/create-issue");
const { resolveIssue } = require("../src/resolve-issue");

test("create issue", () => {
  setInputs({ action: "create-issue" });
  run();
  expect(createIssue).toHaveBeenCalled();
  expect(resolveIssue).not.toHaveBeenCalled();
});

test("resolve issue", () => {
  setInputs({ action: "resolve-issue" });
  run();
  expect(createIssue).not.toHaveBeenCalled();
  expect(resolveIssue).toHaveBeenCalled();
});

test("create issue from payload", () => {
  setInputs({});
  context.payload.action = "create-issue";
  run();
  expect(createIssue).toHaveBeenCalled();
  expect(resolveIssue).not.toHaveBeenCalled();
});

test("invalid action", () => {
  setInputs({ action: "invalid" });
  run();
  expect(core.setFailed).toHaveBeenCalledWith("Invalid action type: invalid");
});
