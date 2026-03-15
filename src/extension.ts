// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';

function getCurrentTerminal(): vscode.Terminal | undefined {
	const activeTerminal = vscode.window.activeTerminal;
	if (activeTerminal) {
		return activeTerminal;
	}

	return vscode.window.createTerminal('Git Touchbar');
}

function isGitRepository(): boolean {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return false;
	}

	const workspacePath = workspaceFolders[0].uri.fsPath;
	if (existsSync(`${workspacePath}/.git`)) {
		return true;
	}

	// Fallback: run `git rev-parse --is-inside-work-tree` in the workspace
	try {
		const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: workspacePath });
		return result.status === 0;
	} catch (err) {
		return false;
	}
}

async function runGitCommand(command: string): Promise<void> {
	const terminal = getCurrentTerminal();
	if (!terminal) {
		vscode.window.showErrorMessage('Unable to create or access terminal.');
		return;
	}

	terminal.show();
	terminal.sendText(command, true);
}

async function openCommitInput(): Promise<void> {
	await vscode.commands.executeCommand('workbench.view.scm');
	await vscode.commands.executeCommand('workbench.scm.action.focusNextInput');
}

function registerGitCommands(): vscode.Disposable {
	return vscode.Disposable.from(
		vscode.commands.registerCommand('git-touchbar.commit', () => {
			if (isGitRepository()) {
				void openCommitInput();
				return;
			}

			vscode.window.showErrorMessage('Not a Git repository.');
		}),
		vscode.commands.registerCommand('git-touchbar.push', () => {
			if (isGitRepository()) {
				void runGitCommand('git push');
				return;
			}

			vscode.window.showErrorMessage('Not a Git repository.');
		}),
		vscode.commands.registerCommand('git-touchbar.pull', () => {
			if (isGitRepository()) {
				void runGitCommand('git pull');
				return;
			}
		})
	);
}

function registerInitGitCommand(): vscode.Disposable {
	return vscode.commands.registerCommand('git-touchbar.init', () => {
		if (isGitRepository()) {
			vscode.window.showInformationMessage('Git repository already initialized.');
			return;
		}

		void runGitCommand('git init');
	});
}

export async function activate(context: vscode.ExtensionContext) {
	let commandRegistration: vscode.Disposable | undefined;

	const syncGitTouchbarState = async (): Promise<void> => {
		const enabled = isGitRepository();
		await vscode.commands.executeCommand('setContext', 'gitTouchbarEnabled', enabled);

		if (enabled && !commandRegistration) {
			commandRegistration = registerGitCommands();
			return;
		}

		if (!enabled && commandRegistration) {
			commandRegistration.dispose();
			commandRegistration = undefined;
		}
	};

	const gitDirectoryWatcher = vscode.workspace.createFileSystemWatcher('**/.git');
	const gitHeadWatcher = vscode.workspace.createFileSystemWatcher('**/.git/HEAD');
	const initGitCommand = registerInitGitCommand();

	context.subscriptions.push(
		initGitCommand,
		{ dispose: () => commandRegistration?.dispose() },
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			void syncGitTouchbarState();
		}),
		gitDirectoryWatcher,
		gitHeadWatcher,
		gitDirectoryWatcher.onDidCreate(() => {
			void syncGitTouchbarState();
		}),
		gitDirectoryWatcher.onDidDelete(() => {
			void syncGitTouchbarState();
		}),
		gitHeadWatcher.onDidCreate(() => {
			void syncGitTouchbarState();
		}),
		gitHeadWatcher.onDidDelete(() => {
			void syncGitTouchbarState();
		})
	);

	await syncGitTouchbarState();
}

// This method is called when your extension is deactivated
export function deactivate() {}
