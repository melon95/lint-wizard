import spawn from "cross-spawn";
import fs from "fs";
import path from "path";
import { error as logError } from './log.js';

function findPackageJson(startDir: string = process.cwd()) {
    let dir = path.resolve(startDir);

    do {
        const pkgFile = path.join(dir, "package.json");

        if (!fs.existsSync(pkgFile) || !fs.statSync(pkgFile).isFile()) {
            dir = path.join(dir, "..");
            continue;
        }
        return pkgFile;
    } while (dir !== path.resolve(dir, ".."));
    return null;
}

function installSyncSaveDev(packages: string|string[], packageManager = "npm") {
    const packageList = Array.isArray(packages) ? packages : [packages];
    const installCmd = packageManager === "yarn" ? "add" : "install";
    const installProcess = spawn.sync(packageManager, [installCmd, "-D"].concat(packageList),
        { stdio: "inherit" });
    const error = installProcess.error;

    if (error) {
        const pluralS = packageList.length > 1 ? "s" : "";

        logError(`Could not execute ${packageManager}. Please install the following package${pluralS} with a package manager of your choice: ${packageList.join(", ")}`);
    }
}

/**
 * Fetch `peerDependencies` of the given package by `npm show` command.
 * @param {string} packageName The package name to fetch peerDependencies.
 * @returns {Object} Gotten peerDependencies. Returns null if npm was not found.
 */
function fetchPeerDependencies(packageName: string) {
    const npmProcess = spawn.sync(
        "npm",
        ["show", "--json", packageName, "peerDependencies"],
        { encoding: "utf8" }
    );

    const error = npmProcess.error;

    if (error) {
        return null;
    }
    const fetchedText = npmProcess.stdout.trim();

    return JSON.parse(fetchedText || "{}");


}

interface CheckOption {
  dependencies?: boolean
  devDependencies?: boolean
  startDir?: string
}
interface CheckResult {
  [key: string]: boolean 
}

function check(packages: string[], opt: CheckOption) {
    const deps = new Set();
    const pkgJson = (opt) ? findPackageJson(opt.startDir) : findPackageJson();

    if (!pkgJson) {
        throw new Error("Could not find a package.json file. Run 'npm init' to create one.");
    }

    const fileJson = JSON.parse(fs.readFileSync(pkgJson, "utf8"));

    const depKeys = ["dependencies", "devDependencies"] as const

    depKeys.forEach(key => {
        if (opt[key] && typeof fileJson[key] === "object") {
            Object.keys(fileJson[key]).forEach(dep => deps.add(dep));
        }
    });

    return packages.reduce((status: CheckResult, pkg) => {
        status[pkg] = deps.has(pkg);
        return status;
    }, {});
}

function checkDeps(packages: string[], rootDir: string) {
    return check(packages, { dependencies: true, startDir: rootDir });
}

function checkDevDeps(packages:string[]) {
    return check(packages, { devDependencies: true });
}

function checkPackageJson(startDir: string): boolean {
    return !!findPackageJson(startDir);
}

export {
  installSyncSaveDev,
  fetchPeerDependencies,
  findPackageJson,
  checkDeps,
  checkDevDeps,
  checkPackageJson
};

