import { type Answer } from "@/prompt/index.js";
import { Legacy } from "@eslint/eslintrc";
import fs from 'fs';
import writeConfigFile from './configFile.js';
import { info } from "./log.js";
import * as npmUtils from "./npm.js";

import { ESLintConfig, ESLintECMAVersion } from "types-eslintrc";

const { ConfigOps, naming } = Legacy;

function getPeerDependencies(moduleName: string) {
    let result = getPeerDependencies.cache.get(moduleName);

    if (!result) {
        info(`Checking peerDependencies of ${moduleName}`);

        result = npmUtils.fetchPeerDependencies(moduleName);
        getPeerDependencies.cache.set(moduleName, result);
    }

    return result;
}
getPeerDependencies.cache = new Map();

export const getModulesList = (config: LintConfig) => {
	const modules: {
    [key: string]: string
  } = {};

	// Create a list of modules which should be installed based on config
	if (config.plugins) {
		for (const plugin of config.plugins) {
			const moduleName: string = naming.normalizePackageName(plugin, "eslint-plugin");

			modules[moduleName] = "latest";
		}
	}

	const extendList = [];
	const overrides = config.overrides || [];

	for (const item of [config, ...overrides]) {
		if (typeof item.extends === "string") {
			extendList.push(item.extends);
		} else if (Array.isArray(item.extends)) {
			extendList.push(...item.extends);
		}
	}

	for (const extend of extendList) {
		if (extend.startsWith("eslint:") || extend.startsWith("plugin:")) {
			continue;
		}
		const moduleName = naming.normalizePackageName(extend, "eslint-config");

		modules[moduleName] = "latest";
		Object.assign(modules, getPeerDependencies(`${moduleName}@latest`));
	}

	const parser = config.parser;

	if (parser) {
		modules[parser] = "latest";
	}

  const installStatus = npmUtils.checkDevDeps(["eslint"]);
  // Mark to show messages if it's new installation of eslint.
  if (installStatus.eslint === false) {
    info("Local ESLint installation not found.");
    modules.eslint = modules.eslint || "latest";
  }

	return Object.keys(modules).map((name) => `${name}@${modules[name]}`);
};

export type LintConfig = ESLintConfig & {
	extends: string[];
};

export const generatorConfig = (answers: Answer): LintConfig => {
	const config: LintConfig & {
		extends: string[];
	} = {
		rules: {},
		env: {},
		parserOptions: {},
		extends: [],
		overrides: [],
	};

	config.parserOptions.ecmaVersion = "latest" as unknown as ESLintECMAVersion;
	config.env.es2022 = true;

	// set the module type
	if (answers.module === "esm") {
		config.parserOptions.sourceType = "module";
	} else if (answers.module === "commonjs") {
		config.env.commonjs = true;
	}

	// add in browser and node environments if necessary
	// answers.env.forEach(env => {
	//     config.env[env] = true;
	// });

	// add in library information
	if (answers.framework === "react") {
		config.plugins = ["react"];
		config.extends.push("plugin:react/recommended");
	} else if (answers.framework === "vue") {
		config.plugins = ["vue"];
		config.extends.push("plugin:vue/vue3-essential");
	}

	if (answers.styleGuide === "airbnb" && answers.framework !== "react") {
		config.extends.push("airbnb-base");
	} else if (answers.styleGuide === "xo-typescript") {
		config.extends.push("xo");
		config.overrides.push({
			files: ["*.ts", "*.tsx"],
			extends: ["xo-typescript"],
		});
	} else {
		config.extends.push(answers.styleGuide);
	}

	if (answers.useTypeScript && config.extends.includes("eslint:recommended")) {
		config.extends.push("plugin:@typescript-eslint/recommended");
	}

	// normalize extends
	// if (config.extends.length === 0) {
	//     delete config.extends;
	// } else if (config.extends.length === 1) {
	//     config.extends = config.extends[0];
	// }

	ConfigOps.normalizeToStrings(config);
	return config;
};

export async function writeFile(config: LintConfig, fileType: Answer['configFileType']) {

    // default is .js
    let extname = ".js";

    if (fileType === "YAML") {
        extname = ".yml";
    } else if (fileType === "JSON") {
        extname = ".json";
    } else if (fileType === "JavaScript") {
        const pkgJSONPath = npmUtils.findPackageJson();

        if (pkgJSONPath) {
            const pkgJSONContents = JSON.parse(fs.readFileSync(pkgJSONPath, "utf8"));

            if (pkgJSONContents.type === "module") {
                extname = ".cjs";
            }
        }
    }
    await writeConfigFile(config, `./.eslintrc${extname}`);
    info(`Successfully created .eslintrc${extname} file in ${process.cwd()}`);
}