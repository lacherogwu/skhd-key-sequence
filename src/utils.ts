/**
 * Open files, directories, and URLs.
 * @param url - File, directory, or URL.
 * @param options - Additional options.
 * @param options.with - The application to open the URL with.
 *
 * @example
 * open('https://google.com');
 * open('raycast://extensions/raycast/raycast/confetti');
 * open('~/Downloads');
 * open('~/Downloads/file.txt');
 * open('~/Downloads/file.txt', { with: 'Visual Studio Code' });
 * open('~/Downloads/file.txt', { with: 'com.microsoft.VSCode' });
 */
export function open(value: string, options?: { with?: string }) {
	if (options?.with) {
		if (isBundleId(options.with)) {
			return `open -b ${options.with} ${value}`;
		}
		return `open -a "${options.with}" ${value}`;
	}
	return `open ${value}`;
}

/**
 * Open an application by name or bundle id.
 * @param name - Application name or bundle id.
 *
 * @example
 * app('com.apple.Safari');
 * app('Safari');
 */
export function app(name: string) {
	if (isBundleId(name)) {
		return open(`-b ${name}`);
	}
	return open(`-a "${name}.app"`);
}

function isBundleId(str: string) {
	return /^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(str);
}
