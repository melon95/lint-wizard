import { configFileTypePrompt, eslintJavaScriptPrompt, eslintTypeScriptPrompt, frameworkPrompt, modulePrompt, packageManagementPrompt } from './const.js';

interface ChoiceItem {
  name: string
  value: string
}

type TupleToUnion<T extends readonly ChoiceItem[]> = T[number]['value'];

export interface Answer {
	module: TupleToUnion<typeof modulePrompt.choices>
	framework:  TupleToUnion<typeof frameworkPrompt.choices>
	useTypeScript: boolean;
	styleGuide: TupleToUnion<typeof eslintJavaScriptPrompt.choices> | TupleToUnion<typeof eslintTypeScriptPrompt.choices>;
  configFileType: TupleToUnion<typeof configFileTypePrompt.choices>
}

export interface InstallAnswer {
  executeInstallation: boolean
  packageManager?: TupleToUnion<typeof packageManagementPrompt.choices>
}

type Choice = typeof frameworkPrompt.choices
type ts = Omit<Choice, 'name'>