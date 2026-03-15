# git-touchbar

`git-touchbar` adds Git actions to the macOS Touch Bar inside VS Code.

The extension is repository-aware:

- In a folder without Git initialized, it shows `Init Git`.
- In a Git repository, it shows `Commit`, `Push`, and `Pull`.

## Current behavior

- `Init Git` runs `git init` in the active terminal.
- `Commit` opens the built-in Source Control view and focuses the commit input.
	This lets you use VS Code's own commit workflow, including the built-in `Generate Commit Message` action when Copilot is available.
- `Push` and `Pull` are currently placeholders and do not run Git commands yet.

## Requirements

- macOS with Touch Bar support.
- VS Code `1.110.0` or newer.
- Git installed and available on `PATH`.
- A workspace folder must be open.

## How it works

The extension checks whether the current workspace is a Git repository by:

- checking for a `.git` entry in the workspace root
- falling back to `git rev-parse --is-inside-work-tree`

It keeps the Touch Bar state in sync by watching for:

- workspace folder changes
- `.git` creation/deletion
- `.git/HEAD` creation/deletion

## Testing

To test the extension locally:

1. Open this project in VS Code.
2. Start the watch task if it is not already running.
3. Press `F5` to launch an Extension Development Host.
4. In the new window, open a normal folder.

Expected behavior:

- In a non-repository folder, the Touch Bar should show `Init Git`.
- After running `Init Git`, the Touch Bar should switch to `Commit`, `Push`, and `Pull`.
- In an existing Git repository, the Touch Bar should show `Commit`, `Push`, and `Pull` immediately.

You can also verify command visibility from the Command Palette:

- non-repo folder: `Init Git`
- repo folder: `Commit`, `Push`, `Pull`

## Development commands

```sh
pnpm run watch
pnpm run check-types
pnpm run lint
pnpm test
```

## Known limitations

- VS Code does not reliably render extension-contributed command icons in the Touch Bar, so icon definitions in `package.json` may not appear there.
- The extension currently checks only the first workspace folder when determining repository state.

## Release notes

### 0.0.1

- Added Touch Bar Git actions for macOS.
- Added repo-aware `Init Git` and `Commit` visibility.
- Added `Pull` and `Push` commands
- Wired `Commit` to the built-in Source Control input.
