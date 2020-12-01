const mockMoment = function () {
  return jest.requireActual("moment-timezone")("2020-01-01T00:00:00.000Z");
};
module.exports = Object.assign(
  mockMoment,
  jest.requireActual("moment-timezone")
);
