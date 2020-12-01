jest.mock("../src/gh");
const { setInputs } = require("./test-utils");
const { getRelease } = require("../src/gh");
const { resolveIssue } = require("../src/resolve-issue");
const {
  mockFindIssue,
  mockTransitionIssue,
} = require("../__mocks__/jira-client");

beforeEach(() => {
  setInputs({
    "configuration-file": ".github/jira-config.yml",
  });
  getRelease.mockReturnValueOnce(
    Promise.resolve({
      data: { body: "Some text\n[DEMO-4321](link1)\n[DEMO-1234](link2)" },
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
