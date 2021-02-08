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
    "Ticket description\n\n*Author*\n[~user1@example.com]\n\n*Reviewers*\n[user2|https://github.com/user2]\n"
  );
  expect(appendReleaseBody).toHaveBeenCalledWith(
    "Jira issue: [DEMO-1234](https://example.com/browse/DEMO-1234)"
  );
});

test("issue body is cleaned up", async () => {
  setInputs({
    "jira-host": "example.com",
    "issue-descriptor": "Jira issue",
    title: "Ticket title",
    description:
      "Bumps [uvicorn[standard]](https://github.com/encode/uvicorn) from 0.12.3 to 0.13.3.\n" +
      "<details><summary><strong>Bug fixes</strong></summary><p>\n" +
      "- some fix [abcd12](link)\n" +
      "</p></details>\n" +
      "<blockquote>\n" +
      "<em>Emphasis</em>\n" +
      "<ul>\n<li>list item</li>\n</ul>\n" +
      '<a href="http://example.com">link</a>\n' +
      "<h1>Title</h1>\n" +
      "[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=uvicorn[standard]&package-manager=pip&previous-version=0.12.3&new-version=0.13.3)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)\n" +
      '<li><a href="https://github.com/googleapis/python-secret-manager/commit/eb0c748bb930f35c4cfeedceebab9fd6ec6a13ad"><code>eb0c748</code></a> chore: release 2.2.0 (<a href="https://github-redirect.dependabot.com/googleapis/python-secret-manager/issues/74">#74</a>)</li>\n' +
      "<blockquote>",
  });
  await createIssue();
  expect(newIssue).toHaveBeenCalledWith(
    "Ticket title",
    "Bumps [uvicorn[standard]|https://github.com/encode/uvicorn] from 0.12.3 to 0.13.3.\n" +
      "*Bug fixes*\n" +
      "- some fix [abcd12|link]\n\n" +
      "{quote}\n" +
      "_Emphasis_\n\n" +
      "- list item\n\n" +
      "[link|http://example.com]\n" +
      "h1. Title\n" +
      "!https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=uvicorn[standard]&package-manager=pip&previous-version=0.12.3&new-version=0.13.3!\n" +
      "- [{{eb0c748}}|https://github.com/googleapis/python-secret-manager/commit/eb0c748bb930f35c4cfeedceebab9fd6ec6a13ad] chore: release 2.2.0 ([#74|https://github-redirect.dependabot.com/googleapis/python-secret-manager/issues/74])\n" +
      "{quote}\n\n" +
      "*Author*\n" +
      "[~user1@example.com]\n\n" +
      "*Reviewers*\n" +
      "[user2|https://github.com/user2]\n"
  );
});
