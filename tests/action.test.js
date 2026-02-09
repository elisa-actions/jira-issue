import { jest } from "@jest/globals";

const createIssue = jest.fn();
const resolveIssue = jest.fn();

const coreMock = {
  getInput: jest.fn(),
  setFailed: jest.fn(),
};

const githubMock = {
  context: { payload: {}, issue: {}, repo: {} },
  getOctokit: jest.fn(),
};

jest.unstable_mockModule("@actions/core", () => coreMock);
jest.unstable_mockModule("@actions/github", () => githubMock);
jest.unstable_mockModule("../src/create-issue.js", () => ({ createIssue }));
jest.unstable_mockModule("../src/resolve-issue.js", () => ({ resolveIssue }));

const { setInputs } = await import("./test-utils.js");
const core = await import("@actions/core");
const { context } = await import("@actions/github");
const { run } = await import("../src/action.js");

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
