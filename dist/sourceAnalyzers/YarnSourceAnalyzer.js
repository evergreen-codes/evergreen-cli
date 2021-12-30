"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = (0, tslib_1.__importStar)(require("path"));
const depcheck_1 = (0, tslib_1.__importDefault)(require("depcheck"));
const SourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("./SourceAnalyzer"));
const yarn_1 = require("../utils/yarn");
class YarnSourceAnalyzer extends SourceAnalyzer_1.default {
    constructor() {
        super(...arguments);
        this.usagesCache = {};
    }
    async getUsages(projectRoot) {
        if (this.usagesCache[projectRoot]) {
            return this.usagesCache[projectRoot];
        }
        const workspacePaths = await (0, yarn_1.getWorkspacePaths)(projectRoot);
        const usages = [];
        const rootUsages = await (0, depcheck_1.default)(path.join(process.cwd(), projectRoot), {});
        for await (const workspacePath of workspacePaths) {
            const workspaceUsages = await (0, depcheck_1.default)(path.join(process.cwd(), workspacePath), {});
            usages.push(workspaceUsages);
        }
        const using = usages.reduce((prev, curr) => {
            const next = { ...prev };
            Object.keys(curr.using).forEach((dep) => {
                if (!prev[dep]) {
                    next[dep] = curr.using[dep];
                }
                else {
                    next[dep] = [...prev[dep], ...curr.using[dep]];
                }
            });
            return next;
        }, rootUsages.using);
        this.usagesCache[projectRoot] = using;
        return using;
    }
    getEcosystem() {
        return 'yarn';
    }
    getSourceRegexesForPackage() {
        return null;
    }
    async countOccurances(packageName, projectRoot) {
        const usages = await this.getUsages(projectRoot);
        return (usages[packageName] || []).length;
    }
}
exports.default = YarnSourceAnalyzer;
