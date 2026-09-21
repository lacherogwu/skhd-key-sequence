import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { defineConfig } from './index';
import { MODE_TRACK_FILE_PATH, MODE_EXIT_TIMEOUT, PREFIX } from './constants';

/**
 * Run a skhd command body. stdio is discarded so that the backgrounded timer
 * subshell does not hold the pipes open -- otherwise this would block until the
 * timer fires and the scenario below would be serialised rather than concurrent.
 */
const sh = (script: string) =>
	new Promise<void>((resolve, reject) => {
		const child = spawn('/bin/bash', ['-c', script], { stdio: 'ignore' });
		child.on('exit', () => resolve());
		child.on('error', reject);
	});

/**
 * The production timeout is 0.75s, which is too short to schedule against
 * reliably -- spawning a process costs up to ~0.4s, enough to miss the window
 * entirely. Stretch it for tests so the margins are unambiguous.
 */
const TEST_TIMEOUT = 2.5;
const withTestTimeout = (built: string) => built.replaceAll(`sleep ${MODE_EXIT_TIMEOUT}`, `sleep ${TEST_TIMEOUT}`);

const countExitKeys = async (logPath: string) =>
	(await fs.readFile(logPath, 'utf-8').catch(() => '')).split('\n').filter(l => l.includes('f19')).length;
const sleep = (s: number) => new Promise(r => setTimeout(r, s * 1000));

/** The `:: mode : <command>` body skhd runs when entering a mode. */
function modeEntryCommand(built: string, modeName: string) {
	const line = built.split('\n').find(l => l.startsWith(`:: ${PREFIX}${modeName} :`));
	assert.ok(line, `no mode definition emitted for "${modeName}"`);
	return line.slice(line.indexOf(':', 3) + 1).trim();
}

/** The command a shortcut runs, which must invalidate the pending exit timer. */
function shortcutCommand(built: string, modeName: string, key: string) {
	const prefix = `${PREFIX}${modeName} < ${key} :`;
	const line = built.split('\n').find(l => l.startsWith(prefix));
	assert.ok(line, `no shortcut emitted for ${modeName} < ${key}`);
	return line.slice(prefix.length).trim();
}

describe('mode exit timer', () => {
	test('a stale timer does not exit a mode entered after it', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'skhd-seq-'));
		const track = path.join(tmp, 'in_mode');
		const skhdLog = path.join(tmp, 'skhd-calls.log');

		// Fake `skhd` on PATH so we can observe the exit keystroke without the real daemon.
		const bin = path.join(tmp, 'bin');
		await fs.mkdir(bin);
		await fs.writeFile(path.join(bin, 'skhd'), `#!/bin/bash\necho "$@" >> ${skhdLog}\n`);
		await fs.chmod(path.join(bin, 'skhd'), 0o755);

		const built = defineConfig({
			finder: { modifiers: ['hyper'], key: 'f', shortcuts: { d: 'true' } },
			system: { modifiers: ['hyper'], key: 's', shortcuts: { m: 'true' } },
		})
			.build()
			.replaceAll(MODE_TRACK_FILE_PATH, track);
		const cfg = withTestTimeout(built);

		// Enter one mode and then another before the first has timed out -- pressing
		// a mode trigger and changing your mind. Both steps run in a single shell:
		// spawning a process per step costs enough (~0.4s) to push the second entry
		// past the first mode's timeout, and then the two never overlap at all.
		await sh(
			[
				`export PATH="${bin}:$PATH"`,
				modeEntryCommand(cfg, 'finder'),
				`sleep ${TEST_TIMEOUT * 0.6}`,
				modeEntryCommand(cfg, 'system'),
			].join('\n'),
		);

		// Wait past the point where finder's stale timer fires, but before system's
		// own timer is due.
		await sleep(TEST_TIMEOUT * 0.6);

		const stillInSystemMode = await fs
			.access(track)
			.then(() => true)
			.catch(() => false);

		assert.equal(await countExitKeys(skhdLog), 0, 'a stale timer sent the mode-exit key while a newer mode was active');
		assert.ok(stillInSystemMode, 'the newer mode was exited early by the previous mode\u2019s timer');

		await fs.rm(tmp, { recursive: true, force: true });
	});

	test('a mode still exits on its own timer', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'skhd-seq-'));
		const track = path.join(tmp, 'in_mode');
		const skhdLog = path.join(tmp, 'skhd-calls.log');
		const bin = path.join(tmp, 'bin');
		await fs.mkdir(bin);
		await fs.writeFile(path.join(bin, 'skhd'), `#!/bin/bash\necho "$@" >> ${skhdLog}\n`);
		await fs.chmod(path.join(bin, 'skhd'), 0o755);

		const built = defineConfig({
			finder: { modifiers: ['hyper'], key: 'f', shortcuts: { d: 'true' } },
		})
			.build()
			.replaceAll(MODE_TRACK_FILE_PATH, track);
		const cfg = withTestTimeout(built);

		await sh(`export PATH="${bin}:$PATH"; ${modeEntryCommand(cfg, 'finder')}`);
		await sleep(TEST_TIMEOUT * 1.6);

		const exitKeysSent = await fs.readFile(skhdLog, 'utf-8').catch(() => '');
		assert.match(exitKeysSent, /f19/, 'the mode did not exit on its own timeout');

		await fs.rm(tmp, { recursive: true, force: true });
	});
});

describe('config validation', () => {
	test('rejects two modes bound to the same trigger', () => {
		assert.throws(
			() =>
				defineConfig({
					finder: { modifiers: ['hyper'], key: 's', shortcuts: { d: 'true' } },
					system: { modifiers: ['hyper'], key: 's', shortcuts: { m: 'true' } },
				}),
			/hyper - s/,
		);
	});

	test('allows the same key with different modifiers', () => {
		assert.doesNotThrow(() =>
			defineConfig({
				finder: { modifiers: ['hyper'], key: 's', shortcuts: { d: 'true' } },
				system: { modifiers: ['meh'], key: 's', shortcuts: { m: 'true' } },
			}),
		);
	});

	test('rejects a shortcut bound to the mode exit key', () => {
		assert.throws(
			() =>
				defineConfig({
					finder: { modifiers: ['hyper'], key: 'f', shortcuts: { f19: 'true' } },
				}),
			/f19/,
		);
	});
});
