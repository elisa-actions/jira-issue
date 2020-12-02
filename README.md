# GitHub Action Jira Issue

With this action you can create Jira issues from your GitHub Actions pipeline.

Example configuration for automatic release and ticket creation when a pull request is merged:

```yaml
name: Release

on:
  pull_request:
    types: ["closed"]
    branches: ["master"]
  issue_comment:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Clone PR branch
        uses: actions/checkout@v2
      - name: Create release
        id: create_release
        uses: ElisaOyj/gh-action-pr-release@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          prerelease_id: "rc"
          release_draft: true
      - name: Create ticket
        uses: evjanne/jira-bot@main
        if: ${{ github.event.action == 'closed' && steps.create_release.outputs.version }}
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          jira_host: example.com/jira
          jira_username: ${{ secrets.JIRA_USERNAME }}
          jira_password: ${{ secrets.JIRA_PASSWORD }}
          version: ${{ steps.create_release.outputs.version }}
          title: ${{ steps.create_release.outputs.release_title }}
          description: ${{ steps.create_release.outputs.release_body }}
          release_id: ${{ steps.create_release.outputs.release_id }}
          action: "create-ticket"
      - name: Publish release
        uses: actions/github-script@v3
        if: ${{ github.event.action == 'closed' && steps.create_release.outputs.version }}
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            github.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: "${{ steps.create_release.outputs.release_id }}",
              tag_name: "${{ steps.create_release.outputs.version }}",
              draft: false,
            })
```

Resolve ticket via repository dispatch:

```yaml
name: Resolve ticket

on:
  repository_dispatch:
    types: resolve-ticket

jobs:
  resolve-ticket:
    runs-on: [self-hosted, linux]
    steps:
      - uses: actions/checkout@v2
      - name: Update ticket status
        uses: evjanne/jira-bot@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          jira_host: example.com/jira
          jira_username: ${{ secrets.JIRA_USERNAME }}
          jira_password: ${{ secrets.JIRA_PASSWORD }}
```

## Triggering from repository dispatch

If you configure the repository dispatch event you can trigger the action from a webhook by sending a POST request to https://api.github.com/repos/<user>/<repo>/dispatches.

Here is an example with curl:

```bash
curl -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token <token>" \
    --data '{"event_type": "resolve-ticket", "client_payload": {"version": "1.2.3", "fields": {"customfield_10916": { "id": "15868"}}}}' \
    https://api.github.com/repos/ElisaOyj/gh-action-jira-issue/dispatches
```

You can provide any custom fields you need in the dispatch event, the values will be used as is.

## Inputs

| name                 | required | description                                                                                                 |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `github-token`       | yes      | GitHub token                                                                                                |
| `jira-host`          | yes      | Jira hostname                                                                                               |
| `jira-username`      | yes      | Jira user account                                                                                           |
| `jira-password`      | yes      | Jira password                                                                                               |
| `action`             | yes      | Action type (`create-issue` or `resolve-issue`), can be supplied as a parameter or from repository dispatch |
| `title`              | yes      | Issue title, can be supplied as a parameter or from repository dispatch                                     |
| `version`            | no       | GitHub release version when issue context is not available, also from repository dispatch                   |
| `description`        | no       | Issue description, can be supplied as a parameter or from repository dispatch                               |
| `configuration-file` | no       | Path for field mapping configuration, default `.github/jira-config.yaml`                                    |
| `ticket-descriptor`  | no       | Text to show before issue link in the release                                                               |
| `link-release`       | no       | Add issue link to GitHub release                                                                            |
| `include-author`     | no       | Include PR author in ticket description                                                                     |
| `include-reviews`    | no       | Include reviews in ticket description                                                                       |
| `locale`             | no       | Locale for datetimes, default "fi"                                                                          |
| `timezone`           | no       | Timezone for datetimes, default "Europe/Helsinki"                                                           |

## Configuration file

Many things can be configured from the action inputs but the issue specific configurations live in the Jira configuration file whose default location is `.github/jira-config.yaml`. The file consists of two configuration sections: `create` and `resolve`. These are separate configurations for creating and updating the issues and the format mainly follows the [Jira API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/) requests, but as YAML.

In the create section you need to provide the issue link type and then the fields object that contains the actual issue data. This data must follow the structure in the Jira API definition so make sure that you understand it well. You can use the example configuration in this repository to get you started.

There is a special type of field that you can use to set datetime objects that are calculated on runtime. These are from the sample configuration:

```yaml
create:
  issue_link_type: "Cause"
  fields:
    project:
      id: "11212"
    issuetype:
      id: "50"
    components:
      - id: "17501"
    customfield_10913:
      id: "15862"
    customfield_10898:
      type: current_time
    customfield_10899:
      type: current_time
      offset: "1:00:00"
    customfield_11581:
      id: "16820"
```

These custom fields are using a configuration that is not part of the Jira API specification but a custom implementation in this action. When you set a type for a field with the value `current_time` the action will set the current time as the field value. You can also provide an offset to move the time relatively.

The sample configuration for issue resolution (in the same file):

```yaml
resolve:
  transition:
    id: "21"
  fields:
    resolution:
      id: "1"
    customfield_10914:
      from: customfield_10898
    customfield_10915:
      type: current_time
    customfield_10916:
      id: "15868"
```

Here you can additionally use the `from` setting to copy the value from another field in the existing issue.

## Development

### Unit testing

Tests are implemented with Jest and the test suite can be run with the `npm test` command.

### Building the action

The code needs to be compiled as a release build before it can be run so if you make any changes to the code you need to run `npm run build` and commit the `dist` directory with your changes.

### Pre-commit hooks

This repository comes with two Git pre-commit hooks that handle code formatting and validate commit messages. The prerequisites for the hooks are `make`, `python3` and `wget`. Use `make pre-commit` to setup the pre-commit hooks on your local repository.
