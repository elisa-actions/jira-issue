const core = require("@actions/core");
const { context } = require("@actions/github");

const { newVersion } = require("./jira");

exports.createVersion = async function () {
  console.log("Start version creation");
  const name = core.getInput("name") || context.payload.client_payload.title;
  const description =
    core.getInput("description") || context.payload.client_payload.description;

  await newVersion(name, description);
  console.log(`Version ${name} created`);
};
