import { Config } from './types';
import { PREFIX, MODE_EXIT_TIMEOUT, MODE_EXIT_KEY, MODE_TRACK_FILE_PATH, BEGIN_AUTO_GENERATED_CONFIG, END_AUTO_GENERATED_CONFIG, DEFAULT_SKHD_CONFIG_PATH } from './constants';
import fs from 'node:fs/promises';

export * from './types';
export { app, open } from './utils';

/**
 * Define a skhd configuration.
 * @param config - Configuration.
 *
 * @example
 * const config = defineConfig({
 * 	raycast: {
 * 		modifiers: ['hyper'],
 * 		key: 'r',
 * 		shortcuts: {
 * 			p: open('raycast://extensions/raycast/raycast/confetti'),
 * 		},
 * 	},
 * });
 *
 * await config.save();
 */
export function defineConfig(config: Config) {
	validateConfig(config);

	return {
		build() {
			let result = '';

			const m = (modeName: string) => `${PREFIX}${modeName}`;

			result += '# Mode definitions\n';

			Object.keys(config).forEach(modeName => {
				// Each entry claims the mode with a token unique to this shell. The
				// timeout only fires if that token is still the current one, so a timer
				// left over from a previous mode cannot exit a mode entered after it.
				result += `:: ${m(modeName)} : __t="$(od -An -N8 -tx1 /dev/urandom | tr -d " \\n")"; echo "$__t" > ${MODE_TRACK_FILE_PATH}; (sleep ${MODE_EXIT_TIMEOUT}; [ "$(cat ${MODE_TRACK_FILE_PATH} 2>/dev/null)" = "$__t" ] && { skhd -k '${MODE_EXIT_KEY}'; rm -f ${MODE_TRACK_FILE_PATH}; }) &\n`;
			});

			result += '\n# Mode switches\n';

			Object.entries(config).forEach(([modeName, modeConfig]) => {
				const modifiersString = modeConfig.modifiers?.length ? modeConfig.modifiers.join(' + ') : '';
				const switchKey = modifiersString ? `${modifiersString} - ${modeConfig.key}` : modeConfig.key;
				result += `${switchKey} ; ${m(modeName)}\n`;
			});

			result += '\n# Shortcuts\n';

			Object.entries(config).forEach(([modeName, modeConfig]) => {
				Object.entries(modeConfig.shortcuts).forEach(([key, command]) => {
					result += `${m(modeName)} < ${key} : ${command}; rm -f ${MODE_TRACK_FILE_PATH}; skhd -k '${MODE_EXIT_KEY}'\n`;
					const modifiersString = modeConfig.modifiers?.length ? modeConfig.modifiers.join(' + ') : '';
					if (modifiersString) {
						result += `${m(modeName)} < ${modifiersString} - ${key} : ${command}; rm -f ${MODE_TRACK_FILE_PATH}; skhd -k '${MODE_EXIT_KEY}'\n`;
					}
				});
			});

			result += `\n# Mode Exit\n`;
			const modes = Object.keys(config).map(m).join(', ');
			result += `${modes} < ${MODE_EXIT_KEY} ; default`;

			return result;
		},
		print() {
			console.log(this.build());
		},
		// TODO: add support for custom path
		async save() {
			const skhdConfig = this.build();
			const wrappedConfig = [BEGIN_AUTO_GENERATED_CONFIG, skhdConfig, END_AUTO_GENERATED_CONFIG].join('\n');

			const currentFile = await fs.readFile(DEFAULT_SKHD_CONFIG_PATH, 'utf-8').catch(() => '');
			const cleanedFile = currentFile.replace(new RegExp(`${BEGIN_AUTO_GENERATED_CONFIG}.*${END_AUTO_GENERATED_CONFIG}`, 's'), '').trim();
			const newFile = [cleanedFile, wrappedConfig].join('\n\n').trim();

			await fs.writeFile(DEFAULT_SKHD_CONFIG_PATH, newFile);
			console.log(`Config saved to ${DEFAULT_SKHD_CONFIG_PATH}`);
		},
	};
}

function validateConfig(config: Config) {
	const triggers = new Map<string, string>();

	Object.entries(config).forEach(([modeName, modeConfig]) => {
		const modifiers = modeConfig.modifiers?.length ? modeConfig.modifiers.join(' + ') : '';
		const trigger = modifiers ? `${modifiers} - ${modeConfig.key}` : modeConfig.key;

		const existing = triggers.get(trigger);
		if (existing) {
			throw new Error(`Duplicate mode trigger "${trigger}": used by both "${existing}" and "${modeName}". Only one mode can be bound to a trigger.`);
		}
		triggers.set(trigger, modeName);

		if (modeConfig.key === MODE_EXIT_KEY) {
			throw new Error(`Mode "${modeName}" is triggered by "${MODE_EXIT_KEY}", which is reserved for leaving a mode.`);
		}

		Object.keys(modeConfig.shortcuts).forEach(key => {
			if (key === MODE_EXIT_KEY) {
				throw new Error(`Mode "${modeName}" binds a shortcut to "${MODE_EXIT_KEY}", which is reserved for leaving a mode.`);
			}
		});
	});
}
