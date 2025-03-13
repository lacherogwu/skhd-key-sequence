// src/constants.ts
import os from "node:os";
var PREFIX = "skhd_key_sequence_laTH_";
var MODE_EXIT_TIMEOUT = 0.75;
var MODE_EXIT_KEY = "f19";
var MODE_TRACK_FILE_PATH = `/tmp/${PREFIX}in_mode`;
var BEGIN_AUTO_GENERATED_CONFIG = `# ---------- BEGIN AUTO-GENERATED CONFIG ${PREFIX.slice(0, -1)} ----------`;
var END_AUTO_GENERATED_CONFIG = `# ----------- END AUTO-GENERATED CONFIG ${PREFIX.slice(0, -1)} -----------`;
var DEFAULT_SKHD_CONFIG_PATH = `${os.homedir()}/.skhdrc`;

// src/index.ts
import fs from "node:fs/promises";

// src/utils.ts
function open(value, options) {
  if (options?.with) {
    if (isBundleId(options.with)) {
      return `open -b ${options.with} ${value}`;
    }
    return `open -a "${options.with}" ${value}`;
  }
  return `open ${value}`;
}
function app(name) {
  if (isBundleId(name)) {
    return open(`-b ${name}`);
  }
  return open(`-a "${name}.app"`);
}
function isBundleId(str) {
  return /^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(str);
}

// src/index.ts
function defineConfig(config) {
  return {
    build() {
      let result = "";
      const m = (modeName) => `${PREFIX}${modeName}`;
      result += "# Mode definitions\n";
      Object.keys(config).forEach((modeName) => {
        result += `:: ${m(modeName)} : touch ${MODE_TRACK_FILE_PATH} && (sleep ${MODE_EXIT_TIMEOUT} && if [ -f ${MODE_TRACK_FILE_PATH} ]; then skhd -k '${MODE_EXIT_KEY}'; rm -f ${MODE_TRACK_FILE_PATH}; fi) &
`;
      });
      result += "\n# Mode switches\n";
      Object.entries(config).forEach(([modeName, modeConfig]) => {
        const modifiersString = modeConfig.modifiers?.length ? modeConfig.modifiers.join(" + ") : "";
        const switchKey = modifiersString ? `${modifiersString} - ${modeConfig.key}` : modeConfig.key;
        result += `${switchKey} ; ${m(modeName)}
`;
      });
      result += "\n# Shortcuts\n";
      Object.entries(config).forEach(([modeName, modeConfig]) => {
        Object.entries(modeConfig.shortcuts).forEach(([key, command]) => {
          result += `${m(modeName)} < ${key} : ${command}; rm -f ${MODE_TRACK_FILE_PATH}; skhd -k '${MODE_EXIT_KEY}'
`;
          const modifiersString = modeConfig.modifiers?.length ? modeConfig.modifiers.join(" + ") : "";
          if (modifiersString) {
            result += `${m(modeName)} < ${modifiersString} - ${key} : ${command}; rm -f ${MODE_TRACK_FILE_PATH}; skhd -k '${MODE_EXIT_KEY}'
`;
          }
        });
      });
      result += `
# Mode Exit
`;
      const modes = Object.keys(config).map(m).join(", ");
      result += `${modes} < ${MODE_EXIT_KEY} ; default`;
      return result;
    },
    print() {
      console.log(this.build());
    },
    // TODO: add support for custom path
    async save() {
      const skhdConfig = this.build();
      const wrappedConfig = [BEGIN_AUTO_GENERATED_CONFIG, skhdConfig, END_AUTO_GENERATED_CONFIG].join("\n");
      const currentFile = await fs.readFile(DEFAULT_SKHD_CONFIG_PATH, "utf-8").catch(() => "");
      const cleanedFile = currentFile.replace(new RegExp(`${BEGIN_AUTO_GENERATED_CONFIG}.*${END_AUTO_GENERATED_CONFIG}`, "s"), "").trim();
      const newFile = [cleanedFile, wrappedConfig].join("\n\n").trim();
      await fs.writeFile(DEFAULT_SKHD_CONFIG_PATH, newFile);
      console.log(`Config saved to ${DEFAULT_SKHD_CONFIG_PATH}`);
    }
  };
}
export {
  app,
  defineConfig,
  open
};
