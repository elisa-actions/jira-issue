import { jest } from "@jest/globals";

export const mockAddNewIssue = jest.fn();
export const mockFindIssue = jest.fn();
export const mockTransitionIssue = jest.fn();

export default function JiraClientMock() {
  return {
    addNewIssue: mockAddNewIssue,
    findIssue: mockFindIssue,
    transitionIssue: mockTransitionIssue,
  };
}
