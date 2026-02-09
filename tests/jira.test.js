import { jest } from "@jest/globals";

const coreMock = {
  getInput: jest.fn(),
  setFailed: jest.fn(),
};

const githubMock = {
  context: { payload: { client_payload: {} }, issue: {}, repo: {} },
  getOctokit: jest.fn(),
};

const mockAddNewIssue = jest.fn();
const mockFindIssue = jest.fn();
const mockTransitionIssue = jest.fn();

function JiraClientMock() {
  return {
    addNewIssue: mockAddNewIssue,
    findIssue: mockFindIssue,
    transitionIssue: mockTransitionIssue,
  };
}

jest.unstable_mockModule("@actions/core", () => coreMock);
jest.unstable_mockModule("@actions/github", () => githubMock);
jest.unstable_mockModule("jira-client", () => ({ default: JiraClientMock }));
jest.unstable_mockModule("moment-timezone", () => {
  const helsinkiOffsetMinutes = 120;
  const baseUtcMs = Date.parse("2020-01-01T00:00:00.000Z");

  function formatHelsinki(msUtc) {
    const localMs = msUtc + helsinkiOffsetMinutes * 60 * 1000;
    const d = new Date(localMs);
    const pad2 = (n) => String(n).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    const mm = pad2(d.getUTCMonth() + 1);
    const dd = pad2(d.getUTCDate());
    const hh = pad2(d.getUTCHours());
    const mi = pad2(d.getUTCMinutes());
    const ss = pad2(d.getUTCSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+02:00`;
  }

  const moment = function () {
    let currentUtcMs = baseUtcMs;
    return {
      add(durationMs) {
        currentUtcMs += durationMs;
        return this;
      },
      format() {
        return formatHelsinki(currentUtcMs);
      },
    };
  };

  moment.locale = jest.fn();
  moment.defaultFormat = "";
  moment.tz = { setDefault: jest.fn() };
  moment.duration = (offset) => {
    if (typeof offset === "number") return offset;
    if (typeof offset !== "string") return 0;

    const parts = offset.split(":").map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n))) return 0;

    const [h = 0, m = 0, s = 0] = parts;
    return ((h * 60 + m) * 60 + s) * 1000;
  };

  return { default: moment };
});

const { setInputs } = await import("./test-utils.js");
const { context } = await import("@actions/github");
const { newIssue, getIssue, resolveIssue } = await import("../src/jira.js");

beforeEach(() => {
  setInputs({
    "configuration-file": ".github/jira-config.yml",
  });
  mockAddNewIssue.mockReturnValue(Promise.resolve({ key: "DEMO-1234" }));
  mockFindIssue.mockReturnValue(
    Promise.resolve({
      id: "1234",
      fields: { customfield_10898: "2020-01-01T11:11:00+02:00" },
    })
  );
  context.payload.client_payload = {
    version: "1.2.3",
    fields: {
      customfield_10916: { id: "15873" },
    },
  };
});

test("new issue with feature ticket", async () => {
  const issue = await newIssue("DEMO-4321 Some title", "Description");
  expect(issue).toEqual({ key: "DEMO-1234" });
  expect(mockAddNewIssue).toHaveBeenCalledWith({
    update: {
      issuelinks: [
        { add: { type: { name: "Cause" }, inwardIssue: { key: "DEMO-4321" } } },
      ],
    },
    fields: {
      summary: "Some title",
      description: "Description",
      project: { id: "11212" },
      issuetype: { id: "50" },
      components: [{ id: "17501" }],
      customfield_10913: { id: "15862" },
      customfield_10898: "2020-01-01T02:00:00+02:00",
      customfield_10899: "2020-01-01T03:00:00+02:00",
      customfield_11581: { id: "16820" },
    },
  });
});

test("new issue with non-existing feature ticket", async () => {
  mockFindIssue.mockImplementation(() => {
    throw new Error("Not found");
  });
  const issue = await newIssue("DEMO-4321 Some title", "Description");
  expect(issue).toEqual({ key: "DEMO-1234" });
  expect(mockAddNewIssue).toHaveBeenCalledWith({
    update: {},
    fields: {
      summary: "Some title",
      description: "Description",
      project: { id: "11212" },
      issuetype: { id: "50" },
      components: [{ id: "17501" }],
      customfield_10913: { id: "15862" },
      customfield_10898: "2020-01-01T02:00:00+02:00",
      customfield_10899: "2020-01-01T03:00:00+02:00",
      customfield_11581: { id: "16820" },
    },
  });
});

test("new issue without feature ticket", async () => {
  await newIssue("Some title", "Description");
  expect(mockAddNewIssue).toHaveBeenCalledWith({
    update: {},
    fields: {
      summary: "Some title",
      description: "Description",
      project: { id: "11212" },
      issuetype: { id: "50" },
      components: [{ id: "17501" }],
      customfield_10913: { id: "15862" },
      customfield_10898: "2020-01-01T02:00:00+02:00",
      customfield_10899: "2020-01-01T03:00:00+02:00",
      customfield_11581: { id: "16820" },
    },
  });
});

test("resolve issue", async () => {
  const issue = await getIssue("DEMO-1234");
  await resolveIssue(issue);
  expect(mockTransitionIssue).toHaveBeenCalledWith("1234", {
    fields: {
      customfield_10914: "2020-01-01T11:11:00+02:00",
      customfield_10915: "2020-01-01T02:00:00+02:00",
      customfield_10916: { id: "15873" },
      resolution: { id: "1" },
    },
    transition: { id: "21" },
  });
});
