import * as core from "@actions/core";

export function setInputs(data) {
  core.getInput.mockImplementation((name, params = {}) => {
    return data[name] || "";
  });
}
