jest.mock("../src/gh");
jest.mock("../src/jira");
const { setInputs } = require("./test-utils");

const { newVersion } = require("../src/jira");
const { createVersion } = require("../src/create-version");

test("create version", async () => {
  setInputs({
    "jira-host": "example.com",
    name: "Some project 1.0.0",
    description: "Version description",
  });
  await createVersion();
  expect(newVersion).toHaveBeenCalledWith(
    "Some project 1.0.0",
    "Version description"
  );
});
