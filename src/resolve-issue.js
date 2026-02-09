import { getRelease } from "./gh.js";
import { getIssue, resolveIssue as resolveJiraIssue } from "./jira.js";

export async function resolveIssue() {
  console.log("Start issue resolution");
  const release = await getRelease();
  const issueNumber = parseIssueNumber(release.body);
  console.log(`Get issue ${issueNumber}`);
  const issue = await getIssue(issueNumber);
  console.log("Resolve issue");
  await resolveJiraIssue(issue);
}

function parseIssueNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/gm;
  const result = releaseBody.match(re);
  const ticket = result ? result[result.length - 1].slice(1, -1) : null;
  return ticket;
}
