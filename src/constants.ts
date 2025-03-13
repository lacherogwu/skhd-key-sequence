import os from 'node:os';

export const PREFIX = 'skhd_key_sequence_laTH_';
export const MODE_EXIT_TIMEOUT = 0.75;
export const MODE_EXIT_KEY = 'f19';
export const MODE_TRACK_FILE_PATH = `/tmp/${PREFIX}in_mode`;
export const BEGIN_AUTO_GENERATED_CONFIG = `# ---------- BEGIN AUTO-GENERATED CONFIG ${PREFIX.slice(0, -1)} ----------`;
export const END_AUTO_GENERATED_CONFIG = `# ----------- END AUTO-GENERATED CONFIG ${PREFIX.slice(0, -1)} -----------`;
export const DEFAULT_SKHD_CONFIG_PATH = `${os.homedir()}/.skhdrc`;
