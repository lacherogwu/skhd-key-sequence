/**
 * Key modifiers
 *
 * hyper (cmd + shift + alt + ctrl)
 * meh (shift + alt + ctrl)
 */
export type Modifier = 'fn' | 'cmd' | 'lcmd' | 'rcmd' | 'shift' | 'lshift' | 'rshift' | 'alt' | 'lalt' | 'ralt' | 'ctrl' | 'lctrl' | 'rctrl' | 'hyper' | 'meh';

export type Key =
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f'
	| 'g'
	| 'h'
	| 'i'
	| 'j'
	| 'k'
	| 'l'
	| 'm'
	| 'n'
	| 'o'
	| 'p'
	| 'q'
	| 'r'
	| 's'
	| 't'
	| 'u'
	| 'v'
	| 'w'
	| 'x'
	| 'y'
	| 'z'
	| '0'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| 'return'
	| 'space'
	| 'tab'
	| 'backspace'
	| 'escape'
	| KeyNoFn;

export type KeyNoFn =
	| 'delete'
	| 'home'
	| 'end'
	| 'pageup'
	| 'pagedown'
	| 'insert'
	| 'left'
	| 'right'
	| 'up'
	| 'down'
	| 'f1'
	| 'f2'
	| 'f3'
	| 'f4'
	| 'f5'
	| 'f6'
	| 'f7'
	| 'f8'
	| 'f9'
	| 'f10'
	| 'f11'
	| 'f12'
	| 'f13'
	| 'f14'
	| 'f15'
	| 'f16'
	| 'f17'
	| 'f18'
	| 'f19'
	| 'f20'
	| 'sound_up'
	| 'sound_down'
	| 'mute'
	| 'play'
	| 'previous'
	| 'next'
	| 'rewind'
	| 'fast'
	| 'brightness_up'
	| 'brightness_down'
	| 'illumination_up'
	| 'illumination_down';

// TODO: when modifier has fn, key must be KeyNoFn
export type Config = {
	[name: string]: {
		modifiers?: Modifier[];
		key: Key;
		shortcuts: {
			[key in Key | KeyNoFn]?: string;
		};
	};
};
