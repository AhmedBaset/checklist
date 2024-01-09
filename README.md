<p align="center">
  <a href="https://github.com/karlderkaefer/github-action-checkbox-trigger/actions"><img alt="typescript-action status" src="https://github.com/karlderkaefer/github-action-checkbox-trigger/workflows/build-test/badge.svg"></a>
</p>

# Checkbox Trigger Action

https://github.com/marketplace/actions/checkbox-trigger

This action will check or uncheck a checkbox in pull request description. Also it can be used to run tests on conditionals. This can be used for example to run expensive integration tests only when a checkbox is checked.

## Usage

First create a pull request description with your checkboxes. The action will check or uncheck the checkboxes based on the conditions you specify.

```md
- [ ] Trigger tests
- [ ] Test ok
```

This example workflow will check if `Trigger tests` is checked. If checked, the test will be executed.
Also the checkbox `Test ok` will be unchecked before the tests are executed. If the tests are successful, the checkbox will be checked again.

```yaml
name: Integration Test
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      checked: ${{ steps.detect.outputs.checked }}
      unchecked: ${{ steps.detect.outputs.unchecked }}
    permissions:
      pull-requests: write
    steps:
      - name: Checkbox Trigger
        id: detect
        uses: karlderkaefer/github-action-checkbox-trigger@v1
        with:
          github-token: ${{ github.token }}
          action: detect
      - name: list changes
        run: |
          echo "checked=${{ steps.detect.outputs.checked }}"
          echo "unchecked=${{ steps.detect.outputs.unchecked }}
  
  test:
    name: integration-test
    needs: detect
    runs-on: ubuntu-latest
    if: ${{ contains(needs.detect.outputs.checked, 'Trigger tests') || github.ref == 'refs/heads/main' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Uncheck test ok
        uses: karlderkaefer/github-action-checkbox-trigger@v1
        with:
          github-token: ${{ github.token }}
          action: uncheck
          checkbox: Test ok
      - name: Run tests
        id: test
        run: |
          echo "run tests"
      - name: Mark test successfully
        if: steps.test.outcome == 'success'
        uses: karlderkaefer/github-action-checkbox-trigger@v1
        with:
          github-token: ${{ github.token }}
          action: check
          checkbox: Test ok
```

Following inputs are available:

- `github-token`: The GitHub token to use for authentication. Usually `${{ github.token }}`
- `action`: The action to perform. Can be `check`, `uncheck` or `detect`
- `checkbox`: The checkbox to check or uncheck. Only used for `check` and `uncheck` actions

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  

```bash
npm install
```

Build the typescript and package it for distribution

```bash
npm run build && npm run package
```

Run the tests :heavy_check_mark:  

```bash
npm test
```

## Publish

We use [build-and-tag-action](https://github.com/JasonEtco/build-and-tag-action) to publish a new release. Just push a new tag to the repository and the action will create a new release, including major, minor tags like `v1` and `v1.0`

```bash
# increment release number
gh release create
```
