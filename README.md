# GitHub Action Jira Issue

## Development

### Unit testing

Tests are implemented with Jest and the test suite can be run with the `npm test` command.

### Building the action

The code needs to be compiled as a release build before it can be run so if you make any changes to the code you need to run `npm run build` and commit the `dist` directory with your changes.

### Pre-commit hooks

This repository comes with two Git pre-commit hooks that handle code formatting and validate commit messages. The prerequisites for the hooks are `make`, `python3` and `wget`. Use `make pre-commit` to setup the pre-commit hooks on your local repository.
