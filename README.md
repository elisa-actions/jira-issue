# GitHub Action Jira Issue

## Inputs

| name                 | required | description                                                                                                 |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `github-token`       | yes      | GitHub token                                                                                                |
| `jira-host`          | yes      | Jira hostname                                                                                               |
| `jira-username`      | yes      | Jira user account                                                                                           |
| `jira-password`      | yes      | Jira password                                                                                               |
| `action`             | yes      | Action type (`create-issue` or `resolve-issue`), can be supplied as a parameter or from repository dispatch |
| `title`              | yes      | Issue title, can be supplied as a parameter or from repository dispatch                                     |
| `description`        | no       | Issue description, can be supplied as a parameter or from repository dispatch                               |
| `configuration-file` | no       | Path for field mapping configuration                                                                        |
| `ticket-descriptor`  | no       | Text to show before issue link in the release                                                               |
| `link-release`       | no       | Add issue link to GitHub release                                                                            |
| `include-author`     | no       | Include PR author in ticket description                                                                     |
| `include-reviews`    | no       | Include reviews in ticket description                                                                       |

## Development

### Unit testing

Tests are implemented with Jest and the test suite can be run with the `npm test` command.

### Building the action

The code needs to be compiled as a release build before it can be run so if you make any changes to the code you need to run `npm run build` and commit the `dist` directory with your changes.

### Pre-commit hooks

This repository comes with two Git pre-commit hooks that handle code formatting and validate commit messages. The prerequisites for the hooks are `make`, `python3` and `wget`. Use `make pre-commit` to setup the pre-commit hooks on your local repository.
