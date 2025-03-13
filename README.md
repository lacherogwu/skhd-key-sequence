# skhd-key-sequence

A utility for defining and managing key sequence shortcuts for Simple Hotkey Daemon (skhd) on macOS. This package makes it easy to create complex keyboard shortcuts with mode-based key sequences.

## Description

`skhd-key-sequence` provides a simple API to create and manage sophisticated keyboard shortcuts using [skhd](https://github.com/koekeishiya/skhd). It handles all the complexity of:

- Defining modal keyboard shortcuts
- Managing mode transitions
- Automatic timeout handling
- Generating valid skhd configuration
- Updating your `.skhdrc` file safely

## Installation

### NPM

```bash
npm install skhd-key-sequence
```

### GitHub

```bash
npm install https://github.com/lacherogwu/skhd-key-sequence
```

## Requirements

- macOS (this package is designed for macOS only)
- [skhd](https://github.com/koekeishiya/skhd) installed and configured
- Node.js 16 or higher

## Usage

```typescript
import { defineConfig, open, app } from 'skhd-key-sequence';

// Define your keyboard shortcuts configuration
const config = defineConfig({
	// Define a "raycast" mode triggered by Hyper+R
	raycast: {
		modifiers: ['hyper'], // hyper = cmd + shift + alt + ctrl
		key: 'r', // trigger key
		shortcuts: {
			// In raycast mode, pressing 'p' opens Raycast confetti
			p: open('raycast://extensions/raycast/raycast/confetti'),
			// In raycast mode, pressing 's' opens Discord soundboard
			s: open('raycast://extensions/lachero/discord-soundboard/open-soundboard'),
		},
	},

	// Define an "apps" mode triggered by Cmd+Shift+O
	apps: {
		modifiers: ['cmd', 'shift'],
		key: 'o',
		shortcuts: {
			// In apps mode, pressing 't' opens Terminal
			t: app('Terminal'),
			// In apps mode, pressing 'c' opens Chrome
			c: app('Google Chrome'),
			// You can also use bundle IDs
			v: app('com.microsoft.VSCode'),
		},
	},
});

// Generate and save the configuration to ~/.skhdrc
await config.save();
```

## How It Works

When you activate a mode (by pressing the defined modifiers + key), you enter a special mode where single key presses trigger specific actions. The mode automatically exits after executing a command or after a timeout period (default: 0.75 seconds).

For example, with the configuration above:

1. Press `hyper + r` to enter "raycast" mode
2. Then press `p` to trigger the confetti action
3. The mode will automatically exit after executing the command

## API

### `defineConfig(config: Config)`

Creates a configuration object with methods to build, print and save skhd configuration.

- **Parameters:**
  - `config`: An object defining your modes and shortcuts
- **Returns:**
  - An object with the following methods:
    - `build()`: Generates the raw skhd configuration string
    - `print()`: Prints the configuration to console
    - `save()`: Updates your `~/.skhdrc` file with the generated configuration

### `open(value: string, options?: { with?: string })`

Creates a command to open files, directories, or URLs.

- **Parameters:**
  - `value`: The file, directory, or URL to open
  - `options.with`: Optional application to use for opening
- **Returns:**
  - A string containing the shell command

```typescript
// Examples
open('https://google.com');
open('~/Downloads');
open('~/Downloads/file.txt', { with: 'Visual Studio Code' });
open('~/Downloads/file.txt', { with: 'com.microsoft.VSCode' });
```

### `app(name: string)`

Creates a command to open an application by name or bundle ID.

- **Parameters:**
  - `name`: The application name or bundle ID
- **Returns:**
  - A string containing the shell command

```typescript
// Examples
app('Safari');
app('com.apple.Safari');
```

## Configuration Types

### `Config`

```typescript
type Config = {
	[name: string]: {
		modifiers?: Modifier[];
		key: Key;
		shortcuts: {
			[key in Key | KeyNoFn]?: string;
		};
	};
};
```

### `Modifier`

```typescript
type Modifier = 'fn' | 'cmd' | 'lcmd' | 'rcmd' | 'shift' | 'lshift' | 'rshift' | 'alt' | 'lalt' | 'ralt' | 'ctrl' | 'lctrl' | 'rctrl' | 'hyper' | 'meh';
```

Note: `hyper` is a shortcut for `cmd + shift + alt + ctrl`, and `meh` is a shortcut for `shift + alt + ctrl`.

### `Key`

Includes all alphanumeric keys, plus special keys like `return`, `space`, `tab`, etc.
See the [source code](https://github.com/lacherogwu/skhd-key-sequence/blob/main/src/types.ts) for the complete list.

## How Configuration is Saved

The package adds its generated configuration to your `~/.skhdrc` file between special marker comments. This allows it to update the configuration without affecting any custom shortcuts you may have defined outside these markers.

## Security and Performance

- The package doesn't require any special permissions
- It only modifies your skhd configuration file
- Generated commands are executed by skhd, not by this package

## License

MIT
