"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = (0, tslib_1.__importStar)(require("fs"));
const glob = (0, tslib_1.__importStar)(require("glob"));
const PYPI_MODULE_REGEX = /^(?<packageName>[^\s=]*)={2}(?<version>\S*)\s*(?:--no-binary\s\S*)?\s*(?:-{2}hash=(?<hash>\S*))?(?:\s;\s(?<constraint>.*))?$/;
const HTTP_GITHUB_MODULE_REGEX = /^https?:\/\/github\.com\/(?<org>[^/]*)\/(?<packageName>[^/]*)\/archive\/(?<version>[^.]*).zip\s*(?:--no-binary\s\S*)?\s*(?:-{2}hash=(?<hash>\S*))?(?:\s;\s(?<constraint>.*))?/;
const SSH_GITHUB_MODULE_REGEX = /^git\+https?:\/\/github\.com\/(?<org>[^/]*)\/(?<packageName>[^/]*)\.git@(?<version>[^#]*)\S*\s*(?:--no-binary\s\S*)?\s*(?:-{2}hash=(?<hash>\S*))?(?:\s;\s(?<constraint>.*))?/;
class PipParser {
    async parseRequirementsFile(filepath) {
        const contents = fs.readFileSync(filepath).toString();
        const parsed = [];
        contents.split('\n').forEach((line) => {
            let match;
            let isForked = false;
            if (PYPI_MODULE_REGEX.test(line)) {
                match = line.match(PYPI_MODULE_REGEX);
            }
            else if (HTTP_GITHUB_MODULE_REGEX.test(line)) {
                match = line.match(HTTP_GITHUB_MODULE_REGEX);
                isForked = true;
            }
            else if (SSH_GITHUB_MODULE_REGEX.test(line)) {
                match = line.match(SSH_GITHUB_MODULE_REGEX);
                isForked = true;
            }
            if (match && match.groups) {
                parsed.push({
                    ecosystem: 'pip',
                    environment: filepath.includes('dev') || filepath.includes('test')
                        ? 'development'
                        : 'application',
                    source: filepath,
                    isForked,
                    version: match.groups.version,
                    packageName: match.groups.packageName,
                });
            }
        });
        return parsed;
    }
    getAllRequirementsFilepaths(projectRoot) {
        const files = glob.sync(`${projectRoot}/**/requirements*.txt`);
        return files;
    }
    getEcosystem() {
        return 'pip';
    }
    async getDependencies(projectRoot) {
        const requirementsFiles = this.getAllRequirementsFilepaths(projectRoot);
        const dependencies = [];
        for await (const file of requirementsFiles) {
            const deps = await this.parseRequirementsFile(file);
            for (const dep of deps) {
                const existingDep = dependencies.find((d) => d.packageName === dep.packageName &&
                    d.version === dep.version &&
                    d.isForked === dep.isForked);
                if (existingDep &&
                    existingDep.environment !== 'application' &&
                    dep.environment === 'application') {
                    existingDep.environment = 'application';
                    existingDep.source = dep.source;
                }
                else if (!existingDep) {
                    dependencies.push(dep);
                }
            }
        }
        return dependencies;
    }
}
exports.default = PipParser;
