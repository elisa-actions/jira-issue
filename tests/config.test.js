const { setInputs } = require("./test-utils");
const { parseConfig } = require("../src/config");

test("read configuration", () => {
  setInputs({
    "configuration-file": ".github/jira-config.yml",
  });
  const config = parseConfig();
  expect(config).toEqual({
    create: {
      issue_link_type: "Cause",
      fields: {
        project: { id: "11212" },
        issuetype: { id: "50" },
        components: [{ id: "17501" }],
        customfield_10913: { id: "15862" },
        customfield_10898: { type: "current_time" },
        customfield_10899: { type: "current_time", offset: "1:00:00" },
        customfield_11581: { id: "16820" },
      },
    },
    resolve: {
      fields: {
        customfield_10914: {
          from: "customfield_10898",
        },
        customfield_10915: {
          type: "current_time",
        },
        customfield_10916: {
          id: "15868",
        },
        resolution: {
          id: "1",
        },
      },
      transition: {
        id: "21",
      },
    },
  });
});
