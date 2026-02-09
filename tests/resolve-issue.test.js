import { jest } from "@jest/globals";

const getRelease = jest.fn();

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
jest.unstable_mockModule("../src/gh.js", () => ({ getRelease }));

const { setInputs } = await import("./test-utils.js");
const { resolveIssue } = await import("../src/resolve-issue.js");

beforeEach(() => {
  setInputs({
    "configuration-file": ".github/jira-config.yml",
  });
  getRelease.mockReturnValueOnce(
    Promise.resolve({
      body: "Some text\n[DEMO-4321](link1)\n[DEMO-1234](link2)",
    })
  );
  mockFindIssue.mockReturnValueOnce(
    Promise.resolve({
      id: "1234",
      fields: { customfield_10898: "2020-01-01T11:11:00+02:00" },
    })
  );
});

test("resolve issue", async () => {
  await resolveIssue();
  expect(mockFindIssue).toHaveBeenCalledWith("DEMO-1234");
  expect(mockTransitionIssue).toHaveBeenCalledWith("1234", {
    fields: {
      customfield_10914: "2020-01-01T11:11:00+02:00",
      customfield_10915: "2020-01-01T02:00:00+02:00",
      customfield_10916: { id: "15868" },
      resolution: { id: "1" },
    },
    transition: { id: "21" },
  });
});
