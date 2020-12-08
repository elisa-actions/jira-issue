jest.mock("../src/gh");
jest.mock("../src/jira");
const { setInputs } = require("./test-utils");

const {
  appendReleaseBody,
  getAuthor,
  getReviews,
  getUser,
} = require("../src/gh");
const { newIssue } = require("../src/jira");
const { createIssue } = require("../src/create-issue");

beforeEach(() => {
  getAuthor.mockReturnValueOnce(
    Promise.resolve({
      login: "user1",
    })
  );
  getUser.mockImplementation((username) => {
    if (username == "user1") {
      return Promise.resolve({
        email: "user1@example.com",
      });
    } else if (username == "user2") {
      return Promise.resolve({
        email: null,
        name: null,
        login: "user2",
        html_url: "https://github.com/user2",
      });
    }
  });
  getReviews.mockReturnValueOnce(
    Promise.resolve([
      { state: "APPROVED", user: { id: "1234", login: "user2" } },
      { state: "APPROVED", user: { id: "1234", login: "user2" } },
    ])
  );
  newIssue.mockReturnValueOnce(
    Promise.resolve({
      key: "DEMO-1234",
    })
  );
});

test("create issue", async () => {
  setInputs({
    "jira-host": "example.com",
    "issue-descriptor": "Jira issue",
    title: "Ticket title",
    description: "Ticket description",
  });
  await createIssue();
  expect(newIssue).toHaveBeenCalledWith(
    "Ticket title",
    "Ticket description\n\nAuthor:\n[~user1@example.com]\n\n*Reviewers*\n[user2|https://github.com/user2]\n"
  );
  expect(appendReleaseBody).toHaveBeenCalledWith(
    "Jira issue: [DEMO-1234](https://example.com/browse/DEMO-1234)"
  );
});
