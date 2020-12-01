const core = require("@actions/core");
const { context } = require("@actions/github");
const j2m = require("jira2md");

const { appendReleaseBody, getAuthor, getReviews, getUser } = require("./gh");
const { newIssue } = require("./jira");

exports.createIssue = async function () {
  const jiraHost = core.getInput("jira-host", { required: true });
  const issueDescriptor = core.getInput("issue-descriptor");
  const title = core.getInput("title") || context.payload.client_payload.title;
  const description =
    core.getInput("description") || context.payload.client_payload.description;
  const linkRelease = (core.getInput("link-release") || "true") === "true";

  const issueBody = await buildIssueBody(description);
  const issue = await newIssue(title, issueBody);

  if (linkRelease) {
    const link =
      (issueDescriptor ? `${issueDescriptor}: ` : "") +
      `[${issue.key}](https://${jiraHost}/browse/${issue.key})`;
    await appendReleaseBody(link);
  }
};

async function buildIssueBody(description) {
  const includeAuthor = (core.getInput("include-author") || "true") === "true";
  const includeReviews =
    (core.getInput("include-reviews") || "true") === "true";
  let body = j2m.to_jira(description);

  if (includeAuthor) {
    author = await getAuthor();
    body += "\n\nAuthor:\n";
    body += await getUserLink(author);
  }

  if (includeReviews) {
    reviews = await getReviews();
    if (reviews) {
      body += "\n\n*Reviewers*\n";
      const approvedReviews = reviews.filter(
        (review) => review.state === "APPROVED"
      );
      const uniqueReviews = [
        ...new Map(
          approvedReviews.map((review) => [review.user.id, review])
        ).values(),
      ];
      for (let i = 0; i < uniqueReviews.length; i++) {
        body += (await getUserLink(uniqueReviews[i].user)) + "\n";
      }
    }
  }
  console.log(body);
  return body;
}

async function getUserLink(user) {
  const userData = await getUser(user.login);
  if (userData.email) {
    return `[~${userData.email}]`;
  }
  return `[${userData.name || userData.login}|${userData.html_url}]`;
}
