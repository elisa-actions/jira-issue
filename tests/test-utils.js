jest.mock("@actions/core");
const core = require("@actions/core");

exports.setInputs = function (data) {
  const getInput = jest.fn().mockImplementation((name, params = {}) => {
    return data[name];
  });
  core.getInput = getInput;
};
