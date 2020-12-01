const mockAddNewIssue = jest.fn();

function mock() {
  return {
    addNewIssue: mockAddNewIssue,
  };
}

module.exports = mock;
module.exports.mockAddNewIssue = mockAddNewIssue;
