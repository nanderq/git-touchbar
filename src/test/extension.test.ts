import * as assert from 'assert';

import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	let extension: vscode.Extension<unknown>;

	suiteSetup(async () => {
		extension = getExtensionUnderTest();
		await extension.activate();
	});

	test('registers Git Touch Bar commands in a Git workspace', async () => {
		const commands = await vscode.commands.getCommands(true);

		assert.ok(commands.includes('git-touchbar.init'));
		assert.ok(commands.includes('git-touchbar.commit'));
		assert.ok(commands.includes('git-touchbar.push'));
		assert.ok(commands.includes('git-touchbar.pull'));
	});

	test('contributes repo-aware command palette entries', () => {
		const commandPaletteMenus = extension.packageJSON.contributes?.menus?.commandPalette;

		assert.ok(Array.isArray(commandPaletteMenus));
		assert.deepStrictEqual(
			commandPaletteMenus,
			[
				{
					command: 'git-touchbar.init',
					when: 'workspaceFolderCount > 0 && !gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.commit',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.push',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.pull',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				}
			]
		);
	});

	test('contributes matching touch bar entries', () => {
		const touchBarMenus = extension.packageJSON.contributes?.menus?.touchBar;

		assert.ok(Array.isArray(touchBarMenus));
		assert.deepStrictEqual(
			touchBarMenus,
			[
				{
					command: 'git-touchbar.init',
					when: 'workspaceFolderCount > 0 && !gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.commit',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.push',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				},
				{
					command: 'git-touchbar.pull',
					when: 'workspaceFolderCount > 0 && gitTouchbarEnabled'
				}
			]
		);
	});
});

function getExtensionUnderTest(): vscode.Extension<unknown> {
	const extension = vscode.extensions.all.find(
		(candidate) => candidate.packageJSON?.name === 'git-touchbar'
	);

	assert.ok(extension, 'Expected git-touchbar extension to be available in the test host.');
	return extension;
}
