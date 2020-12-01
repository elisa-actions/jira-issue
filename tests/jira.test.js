const { setInputs } = require("./test-utils");
const { newIssue } = require("../src/jira");
const { mockAddNewIssue } = require("../__mocks__/jira-client");

beforeEach(() => {
  setInputs({
    "configuration-file": ".github/jira-config.yml",
  });
  mockAddNewIssue.mockReturnValue(Promise.resolve({ key: "DEMO-1234" }));
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
  console.log(`Issue is ${issue}`);
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
