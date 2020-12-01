const core = require("@actions/core");
const { context } = require("@actions/github");
const JiraApi = require("jira-client");
const { parseConfig } = require("./config");

const locale = core.getInput("locale") || "fi";
const timezone = core.getInput("timezone") || "Europe/Helsinki";
var moment = require("moment-timezone");
moment.locale(locale);
moment.defaultFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";
moment.tz.setDefault(timezone);

function getJiraClient() {
  return new JiraApi({
    protocol: "https",
    host: core.getInput("jira_host", { required: true }),
    username: core.getInput("jira_username", { required: true }),
    password: core.getInput("jira_password", { required: true }),
    apiVersion: "2",
  });
}

exports.newIssue = async function (title, description) {
  const jira = getJiraClient();
  const parsedTitle = parseTitle(title);
  const issueData = createIssueData(
    parsedTitle.title,
    description,
    parsedTitle.featureTicket
  );
  try {
    return await jira.addNewIssue(issueData);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.getIssue = async function (number) {
  const jira = getJiraClient();
  try {
    return await jira.findIssue(number);
  } catch {
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.resolveIssue = async function (issue) {
  const jira = getJiraClient();
  const config = parseConfig();
  const transition = config.resolve.transition;
  const fields = {};
  if (config.resolve.fields) {
    for (const [key, value] of Object.entries(config.resolve.fields)) {
      if (value.type === "current_time") {
        fields[key] = moment().format();
      } else if (value.from) {
        fields[key] = issue.fields[value.from];
      } else {
        fields[key] = value;
      }
    }
  }
  if (context.payload.client_payload && context.payload.client_payload.fields) {
    Object.assign(fields, context.payload.client_payload.fields);
  }
  const resolve = { transition, fields };
  console.log(`Update issue:\n${JSON.stringify(resolve)}`);
  try {
    await jira.transitionIssue(issue.id, resolve);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

const parseTitle = function (title) {
  const re = /^(\w+\-\d+)(.*)$/;
  const result = re.exec(title);
  if (result) {
    return { featureTicket: result[1], title: result[2].trim() };
  }
  return { title };
};

const createIssueData = function (summary, description, linkedIssueKey) {
  const config = parseConfig();
  const fields = {
    summary: summary,
    description: description,
  };
  if (config.create.fields) {
    for (const [key, value] of Object.entries(config.create.fields)) {
      if (value.type === "current_time") {
        fields[key] = moment().format();
      } else if (value.type === "current_time_plus_hour") {
        fields[key] = moment().add({ hour: 1 }).format();
      } else {
        fields[key] = value;
      }
    }
  }
  const update = {};
  if (linkedIssueKey && config.create && config.create.issue_link_type) {
    update["issuelinks"] = [
      {
        add: {
          type: {
            name: config.create.issue_link_type,
          },
          inwardIssue: {
            key: linkedIssueKey,
          },
        },
      },
    ];
  }
  const issueData = {
    update,
    fields,
  };
  return issueData;
};
