/**
 * Key modifiers
 *
 * hyper (cmd + shift + alt + ctrl)
 * meh (shift + alt + ctrl)
 */
type Modifier = 'fn' | 'cmd' | 'lcmd' | 'rcmd' | 'shift' | 'lshift' | 'rshift' | 'alt' | 'lalt' | 'ralt' | 'ctrl' | 'lctrl' | 'rctrl' | 'hyper' | 'meh';
type Key = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'return' | 'space' | 'tab' | 'backspace' | 'escape' | KeyNoFn;
type KeyNoFn = 'delete' | 'home' | 'end' | 'pageup' | 'pagedown' | 'insert' | 'left' | 'right' | 'up' | 'down' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | 'f13' | 'f14' | 'f15' | 'f16' | 'f17' | 'f18' | 'f19' | 'f20' | 'sound_up' | 'sound_down' | 'mute' | 'play' | 'previous' | 'next' | 'rewind' | 'fast' | 'brightness_up' | 'brightness_down' | 'illumination_up' | 'illumination_down';
type Config = {
    [name: string]: {
        modifiers?: Modifier[];
        key: Key;
        shortcuts: {
            [key in Key | KeyNoFn]?: string;
        };
    };
};

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
declare function open(value: string, options?: {
    with?: string;
}): string;
/**
 * Open an application by name or bundle id.
 * @param name - Application name or bundle id.
 *
 * @example
 * app('com.apple.Safari');
 * app('Safari');
 */
declare function app(name: string): string;

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
declare function defineConfig(config: Config): {
    build(): string;
    print(): void;
    save(): Promise<void>;
};

export { type Config, type Key, type KeyNoFn, type Modifier, app, defineConfig, open };
