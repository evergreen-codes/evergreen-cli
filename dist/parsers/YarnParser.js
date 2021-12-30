"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = (0, tslib_1.__importStar)(require("path"));
const fs = (0, tslib_1.__importStar)(require("fs"));
const lockfile = (0, tslib_1.__importStar)(require("@yarnpkg/lockfile"));
const Parser_1 = (0, tslib_1.__importDefault)(require("./Parser"));
const yarn_1 = require("../utils/yarn");
class YarnParser extends Parser_1.default {
    getEcosystem() {
        return 'yarn';
    }
    getLockfileDependencies(projectRoot) {
        const lockfilePath = path.join(projectRoot, 'yarn.lock');
        const file = fs.readFileSync(lockfilePath, 'utf8');
        const json = lockfile.parse(file);
        const dependencies = {};
        Object.keys(json.object).forEach((dep) => {
            const name = `${dep.startsWith('@') ? '@' : ''}${dep.split('@')[dep.split('@').length - 2]}`;
            if (!dependencies[name]) {
                dependencies[name] = [];
            }
            const version = json.object[dep].version;
            const isForked = !json.object[dep].integrity;
            const existingVersion = dependencies[name].find((d) => d.version === version && d.isForked === isForked);
            if (!existingVersion) {
                dependencies[name].push({
                    version: json.object[dep].version,
                    isForked: !json.object[dep].integrity,
                });
            }
        });
        return dependencies;
    }
    async getWorkspaceDependencies(workspacePath) {
        const packageJson = await (0, yarn_1.parsePackageJson)(path.join(workspacePath, 'package.json'));
        const { devDependencies = {}, dependencies = {} } = packageJson;
        return { dependencies, devDependencies };
    }
    async getAllWorkspaceDependencies(projectRoot) {
        const workspacePaths = await (0, yarn_1.getWorkspacePaths)(projectRoot);
        let dependencies = await this.getWorkspaceDependencies(projectRoot);
        for await (const workspacePath of workspacePaths) {
            const workspaceDependencies = await this.getWorkspaceDependencies(workspacePath);
            dependencies = {
                dependencies: {
                    ...dependencies.dependencies,
                    ...workspaceDependencies.dependencies,
                },
                devDependencies: {
                    ...dependencies.devDependencies,
                    ...workspaceDependencies.devDependencies,
                },
            };
        }
        return dependencies;
    }
    async getDependencies(projectRoot) {
        const workspaceDependencies = await this.getAllWorkspaceDependencies(projectRoot);
        const lockfileDependencies = await this.getLockfileDependencies(projectRoot);
        const applicationDependencies = [];
        Object.keys(lockfileDependencies).forEach((packageName) => {
            const isApplicationDependency = workspaceDependencies.dependencies[packageName];
            const isDevDependency = workspaceDependencies.devDependencies[packageName];
            const directDependency = isApplicationDependency || isDevDependency;
            if (directDependency) {
                lockfileDependencies[packageName].forEach((lockfileDependency) => {
                    applicationDependencies.push({
                        ecosystem: 'yarn',
                        environment: isApplicationDependency
                            ? 'application'
                            : 'development',
                        source: path.join(projectRoot, 'yarn.lock'),
                        packageName,
                        version: lockfileDependency.version,
                        isForked: lockfileDependency.isForked,
                    });
                });
            }
        });
        return applicationDependencies;
    }
}
exports.default = YarnParser;
