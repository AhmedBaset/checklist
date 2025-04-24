<!-- -->

# Checklist Action

GitHub Action to detect checked and unchecked checkboxes in pull request descriptions.

> Originally made to be used internally at a project of mine so it's not very flexible. Feel free to fork and adapt it to your needs.

## Usage

First create a pull request description with your checkboxes. The action will check or uncheck the checkboxes based on the conditions you specify.

```md
## CI

- [x] format
- [x] lint
- [x] typecheck
- [ ] e2e tests 
```

This Github Action will check checkbox status in pull request description and output the checked and unchecked checkboxes.

```yaml
name: Integration Test
on:
  pull_request:

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
        uses: AhmedBaset/checklist@3
        with:
          token: ${{ github.token }}
          # initial PR template to append when no checkboxes are found
          template: |
            ## CI
            - [x] format
            - [x] lint
            - [x] typecheck
            - [ ] e2e tests
            
      - name: list changes
        run: |
          echo "checked=${{ steps.detect.outputs.checked }}"
          echo "unchecked=${{ steps.detect.outputs.unchecked }}

  test:
    name: format
    needs: [detect]
    if: ${{ contains(needs.detect.outputs.checked, 'format') }}
    runs-on: ubuntu-latest
    steps:
      # ...

  lint:
    name: lint
    needs: [detect]
    if: ${{ contains(needs.detect.outputs.checked, 'lint') }}
    runs-on: ubuntu-latest
    steps:
      # ...
```

The `detect` step will output two variables in similar format to the following:

```yaml
checked=format,lint,typecheck
unchecked=e2e tests
```

Following inputs are available:

- `token`: The GitHub token to use for authentication. Usually `${{ github.token }}`
- `template`: The PR template to use when no checkboxes are found. Leave empty to not update the PR description.

## Publish

We use [build-and-tag-action](https://github.com/JasonEtco/build-and-tag-action) to publish a new release. Just push a new tag to the repository and the action will create a new release, including major, minor tags like `v1` and `v1.0`

```bash
# increment release number
gh release create
```

## License

Cloned from [karlderkaefer/github-action-checkbox-trigger](https://github.com/karlderkaefer/github-action-checkbox-trigger)
