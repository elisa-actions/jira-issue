import * as core from "@actions/core";

export function setInputs(data) {
  const getInputMock =
    core.getInput && typeof core.getInput.mockImplementation === "function"
      ? core.getInput
      : jest.spyOn(core, "getInput");

  getInputMock.mockImplementation((name, params = {}) => {
    return data[name] || "";
  });
}
