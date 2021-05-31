const mockAddNewIssue = jest.fn();
const mockFindIssue = jest.fn();
const mockTransitionIssue = jest.fn();
const mockCreateVersion = jest.fn();

function mock() {
  return {
    addNewIssue: mockAddNewIssue,
    findIssue: mockFindIssue,
    transitionIssue: mockTransitionIssue,
    createVersion: mockCreateVersion,
  };
}

module.exports = mock;
module.exports.mockAddNewIssue = mockAddNewIssue;
module.exports.mockFindIssue = mockFindIssue;
module.exports.mockTransitionIssue = mockTransitionIssue;
module.exports.mockCreateVersion = mockCreateVersion;
