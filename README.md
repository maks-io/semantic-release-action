# GitHub Action: Publish npm Package and Create Release

This GitHub Action automates publishing npm packages and creating GitHub releases based on tags.

## Features
- Automatically publishes npm packages when a new tag is pushed.
- Creates a GitHub release with changelog, contributors, and more.

## Usage

### Workflow Example
```yaml
name: Publish Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v3

      - name: Run the Action
        uses: maks-io/semantic-release-action@v1
        with:
          package-manager: 'npm'
