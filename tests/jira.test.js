const { setInputs } = require("./test-utils");
const { newIssue, getIssue, resolveIssue } = require("../src/jira");
const {
  mockAddNewIssue,
  mockFindIssue,
  mockTransitionIssue,
} = require("../__mocks__/jira-client");
const { context } = require("@actions/github");

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
