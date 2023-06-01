import { Answer, InstallAnswer } from "./interface.js";

export const modulePrompt = {
	type: "list",
	message: "What type of modules does your project use?",
	name: "module",
	default: 0,
	choices: [
		{
			name: "ES Modules",
			value: "esm",
		},
		{
			name: "CommonJS",

			value: "commonjs",
		},
	],
} as const;

export const frameworkPrompt = {
	type: "list",
	name: "framework",
	message: "Which framework does your project use?",
	choices: [
		{
			name: "React",
			value: "react",
		},
		{
			name: "Vue",

			value: "vue",
		},
		{
			name: "None of these",

			value: "none",
		},
	],
} as const;

export const useTypeScriptPrompt = {
	type: "confirm",
	name: "useTypeScript",
	message: "Do you use TypeScript",
	default: true,
} as const;

export const eslintStyleTypeScriptGuides = [
	{
		name: "Standard: https://github.com/standard/eslint-config-standard-with-typescript",
		value: "standard-with-typescript",
	},
	{
		name: "XO: https://github.com/xojs/eslint-config-xo-typescript",
		value: "xo-typescript",
	},
] as const;

export const eslintStyleJavaScriptGuides = [
	{
		name: "Airbnb: https://github.com/airbnb/javascript",
		value: "airbnb",
	},
	{
		name: "Standard: https://github.com/standard/standard",
		value: "standard",
	},
	{
		name: "Google: https://github.com/google/eslint-config-google",
		value: "google",
	},
	{ name: "XO: https://github.com/xojs/eslint-config-xo", value: "xo" },
] as const;

export const eslintTypeScriptPrompt = {
	type: "list",
	name: "styleGuide",
	message: "Which style guide do you want to follow?",
	choices: eslintStyleTypeScriptGuides,
	default: 0,
	when(answer: Answer) {
		return answer.useTypeScript;
	},
} as const;

export const eslintJavaScriptPrompt = {
	type: "list",
	name: "styleGuide",
	message: "Which style guide do you want to follow?",
	choices: eslintStyleJavaScriptGuides,
	default: 0,
	when(answer: Answer) {
		return !answer.useTypeScript;
	},
} as const;

export const configFileTypePrompt = {
	type: "list",
	name: "configFileType",
	message: "What format do you want your config file to be in?",
	initial: 0,
	choices: [
		{
			name: "JavaScript",
			value: "JavaScript",
		},
		{
			name: "YAML",
			value: "YAML",
		},
		{
			name: "JSON",
			value: "JSON",
		},
	],
} as const;

export const lintPromptList = [
	modulePrompt,
	frameworkPrompt,
	useTypeScriptPrompt,
	eslintTypeScriptPrompt,
	eslintJavaScriptPrompt,
	configFileTypePrompt,
];

export const askInstallModulesPrompt = {
	type: "confirm",
	name: "executeInstallation",
	message: "Would you like to install them now?",
	default: true,
};

export const packageManagementPrompt = {
  when(ans: InstallAnswer) {
    return ans.executeInstallation
  },
	type: "list",
	name: "packageManager",
	message: "Which package manager do you want to use?",
	initial: 0,
	choices: [
		{
			name: "npm",
			value: "npm",
		},
		{
			name: "yarn",
			value: "yarn",
		},
		{
			name: "pnpm",
			value: "pnpm",
		},
	],
} as const;

export const installPromptList = [
	askInstallModulesPrompt,
	packageManagementPrompt,
];
