const { getRelease } = require("./gh");
const { getIssue, resolveIssue } = require("./jira");

exports.resolveIssue = async function () {
  const release = await getRelease();
  const issueNumber = parseIssueNumber(release.data.body);
  const issue = await getIssue(issueNumber);
  await resolveIssue(issue);
};

function parseIssueNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/gm;
  const result = releaseBody.match(re);
  const ticket = result ? result[result.length - 1].slice(1, -1) : null;
  return ticket;
}
