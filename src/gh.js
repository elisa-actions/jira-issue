const core = require("@actions/core");
const { context, getOctokit } = require("@actions/github");

exports.getPR = async function () {
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);

  if (context.issue) {
    const { owner, repo, number } = context.issue;
    console.log(`Get PR #${number} from issue context`);
    try {
      return await octokit.rest.pulls.get({owner, repo, pull_number: number});
    } catch (error) {
      console.log(`Failed to get data for PR #${number}`);
      core.setFailed(error.message);
      process.exit(1);
    }
  }
  const version =
    core.getInput("version") || context.payload.client_payload.version;
  console.log(`Find PR based on version number ${version}`);
  const { owner, repo } = context.repo;
  let tags;
  try {
    tags = await octokit.paginate(octokit.rest.repos.listTags, {
      owner: owner,
      repo: repo
    });
  } catch (error) {
    console.log(`Failed to list tags for repository ${repo}`);
    core.setFailed(error.message);
    process.exit(1);
  }
  const releaseTag = tags.filter((t) => t.name === version)[0];
  const q = `SHA:${releaseTag.commit.sha}`;
  console.log(`Search pull request with ${q}`);
  try {
    const searchResults = await octokit.rest.search.issuesAndPullRequests({ q });
    console.log(`Found ${searchResults.length} matches`);
    return searchResults.items[0];
  } catch (error) {
    console.log("Failed to find the correct PR");
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getReviews = async function () {
  const pr = await exports.getPR();
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;
  const pull_number = pr.number;
  try {
    return await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
  } catch (error) {
    console.log(`Failed to get reviews for PR #${pull_number}`);
    console.log(JSON.stringify(pr, null, 2));
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getAuthor = async function () {
  try {
    const pr = await exports.getPR();
    return pr.user;
  } catch (error) {
    console.log("Failed to get PR author");
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getUser = async function (username) {
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  try {
    return await octokit.rest.users.getByUsername({ username });
  } catch (error) {
    console.log(`Failed to get user ${username}`);
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getRelease = async function () {
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;
  const release_id = core.getInput("release-id");
  if (release_id) {
    return await octokit.rest.repos.getRelease({ owner, repo, release_id });
  } else {
    const tag =
      core.getInput("version") || context.payload.client_payload.version;
    console.log(`Get release by tag ${tag}`);
    try {
      return await octokit.rest.repos.getReleaseByTag({owner, repo, tag});
    } catch (error) {
      console.log(`Failed to get release ${release_id}`);
      core.setFailed(error.message);
      process.exit(1);
    }
  }
};

exports.appendReleaseBody = async function (text) {
  const release = await exports.getRelease();
  const release_id = release.id;
  const body = release.body + "\n\n" + text;
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;
  try {
    await octokit.rest.repos.updateRelease({owner, repo, release_id, body});
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};
