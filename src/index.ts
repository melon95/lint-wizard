import { Command } from "commander";
import inquirer from "inquirer";
import { installPromptList, lintPromptList, type Answer, type InstallAnswer } from "./prompt/index.js";
import { generatorConfig, getModulesList, writeFile } from './utils/index.js';

const askToInstallModules = (modules: string[]) => {
  return inquirer.prompt(installPromptList)
}

const collectUserAnswer = () => {
	return inquirer.prompt(lintPromptList).then((answers: Answer) => {
    const config = generatorConfig(answers);
    const modules = getModulesList(config);

    return askToInstallModules(modules).then((installAnswers: InstallAnswer) => {
      if (installAnswers.executeInstallation) {
        writeFile(config, answers.configFileType)
      }
    })
	});
};

const program = new Command();
program
	.version("0.1.0")
	.description(
		"CLI tool to generate ESLint, Prettier, etc. config files based on user preferences",
	)
	.command("create")
	.action(() => {
		return collectUserAnswer();
	});
program.parse();
