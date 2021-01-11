const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

exports.getPR = async function () {
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);

  if (context.issue) {
    const { owner, repo, number } = context.issue;
    const pr = await octokit.pulls.get({ owner, repo, pull_number: number });
    return pr;
  }
  const version =
    core.getInput("version") || context.payload.client_payload.version;
  const { owner, repo } = context.repo;
  const tags = await octokit.paginate(
    octokit.repos.listTags.endpoint.merge({ owner, repo })
  );
  const releaseTag = tags.filter((t) => t.name === version)[0];
  const q = `SHA:${releaseTag.commit.sha}`;
  const searchResults = await octokit.search.issuesAndPullRequests({ q });
  const pr = searchResults.data.items[0];
  return pr;
};

exports.getReviews = async function () {
  const pr = await exports.getPR();
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;
  const pull_number = pr.number;
  try {
    const reviews = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
    return reviews.data;
  } catch (error) {
    console.log(`Failed to get reviews for PR #${pull_number}`);
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getAuthor = async function () {
  try {
    const pr = await exports.getPR();
    return pr.data.user;
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
    const user = await octokit.users.getByUsername({ username });
    return user.data;
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
    return await octokit.repos.getRelease({ owner, repo, release_id });
  } else {
    const tag =
      core.getInput("version") || context.payload.client_payload.version;
    console.log(`Get release by tag ${tag}`);
    return await octokit.repos.getReleaseByTag({ owner, repo, tag });
  }
};

exports.appendReleaseBody = async function (text) {
  const release = await exports.getRelease();
  const release_id = release.data.id;
  const body = release.data.body + "\n\n" + text;
  const token = core.getInput("github-token", { required: true });
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;
  octokit.repos.updateRelease({ owner, repo, release_id, body });
};
