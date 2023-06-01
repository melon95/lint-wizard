import spawn from "cross-spawn";
import fs from "fs";
import stringify from "json-stable-stringify-without-jsonify";
import path from "path";
import * as log from "./log.js";
import { type LintConfig } from './tools.js';

const cwd = process.cwd();

interface SortObj {
  key: string, value: string
}
function sortByKey(a: SortObj, b: SortObj) {
    return a.key > b.key ? 1 : -1;
}

function writeJSONConfigFile(config: LintConfig, filePath: string) {
    const content = `${stringify(config, { cmp: sortByKey, space: 4 })}\n`;
    fs.writeFileSync(filePath, content, "utf8");
}

async function writeYAMLConfigFile(config: LintConfig, filePath: string) {
    // lazy load YAML to improve performance when not used
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const yaml = await import("js-yaml");

    const content = yaml.dump(config, { sortKeys: true });

    fs.writeFileSync(filePath, content, "utf8");
}

async function writeJSConfigFile(config: LintConfig, filePath: string) {
    const stringifiedContent = `module.exports = ${stringify(config, { cmp: sortByKey, space: 4 })}\n`;

    fs.writeFileSync(filePath, stringifiedContent, "utf8");

    // import("eslint") won't work in some cases.
    // refs: https://github.com/eslint/create-config/issues/8, https://github.com/eslint/create-config/issues/12
    const eslintBin = path.join(cwd, "./node_modules/.bin/eslint");
    const result = spawn.sync(eslintBin, ["--fix", "--quiet", filePath], { encoding: "utf8" });

    if (result.error || result.status !== 0) {
        log.error("A config file was generated, but the config file itself may not follow your linting rules.");
    }
}

export default async function write(config: LintConfig, filePath: string) {
    switch (path.extname(filePath)) {
        case ".js":
        case ".cjs":
            await writeJSConfigFile(config, filePath);
            break;

        case ".json":
            writeJSONConfigFile(config, filePath);
            break;

        case ".yaml":
        case ".yml":
            await writeYAMLConfigFile(config, filePath);
            break;

        default:
            throw new Error("Can't write to unknown file type.");
    }
}
