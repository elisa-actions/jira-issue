import { jest } from "@jest/globals";

const actualMoment = jest.requireActual("moment-timezone");

const mockMoment = function () {
  return actualMoment("2020-01-01T00:00:00.000Z");
};

export default Object.assign(mockMoment, actualMoment);
