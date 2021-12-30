"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = (0, tslib_1.__importStar)(require("fs"));
const path = (0, tslib_1.__importStar)(require("path"));
const glob = (0, tslib_1.__importStar)(require("glob"));
const LOCKFILE_PACKAGE_REGEX = /^(?<org>[^:]*):(?<packageName>[^:]*):(?<version>[^=]*)=(?<classpaths>.*)/;
const createGradlefileRegex = (org, packageName) => new RegExp(`.*implementation\\s+['"]{1}${org.replace('.', '\\.')}\\:${packageName.replace('.', '\\.')}\\:.*`, 'gmi');
class GradleParser {
    async parseLockfile(filepath) {
        const contents = fs.readFileSync(filepath).toString();
        const parsed = [];
        contents.split('\n').forEach((line) => {
            const gradleFile = fs
                .readFileSync(`${path.dirname(filepath)}/build.gradle`)
                .toString();
            const match = line.match(LOCKFILE_PACKAGE_REGEX);
            if (match && match.groups) {
                const directDependencyMatch = gradleFile.match(createGradlefileRegex(match.groups.org, match.groups.packageName));
                if (directDependencyMatch) {
                    parsed.push({
                        ecosystem: 'gradle',
                        environment: /implementation/.test(directDependencyMatch[0])
                            ? 'application'
                            : 'development',
                        source: filepath,
                        isForked: false,
                        version: match.groups.version,
                        packageName: `${match.groups.org}:${match.groups.packageName}`,
                    });
                }
            }
        });
        return parsed;
    }
    getAllLockfileFilepaths(projectRoot) {
        const files = glob.sync(`${projectRoot}/**/gradle.lockfile`);
        return files;
    }
    getEcosystem() {
        return 'gradle';
    }
    async getDependencies(projectRoot) {
        const requirementsFiles = this.getAllLockfileFilepaths(projectRoot);
        const dependencies = [];
        for await (const file of requirementsFiles) {
            const deps = await this.parseLockfile(file);
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
exports.default = GradleParser;
