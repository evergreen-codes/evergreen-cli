"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = (0, tslib_1.__importStar)(require("fs"));
const glob = (0, tslib_1.__importStar)(require("glob"));
class SourceAnalyzer {
    constructor() {
        this.sourceCache = {};
    }
    getSource(projectRoot, sourceGlob) {
        const cacheKey = `${projectRoot}-${sourceGlob}`;
        if (this.sourceCache[cacheKey]) {
            return this.sourceCache[cacheKey];
        }
        const sourceFiles = [];
        const files = glob.sync(sourceGlob);
        files.forEach((file) => {
            sourceFiles.push(fs.readFileSync(file).toString());
        });
        this.sourceCache[cacheKey] = sourceFiles;
        return sourceFiles;
    }
    async countOccurances(packageName, projectRoot, sourceGlob) {
        const sourceFiles = this.getSource(projectRoot, sourceGlob);
        const regexes = this.getSourceRegexesForPackage(packageName);
        if (!regexes) {
            return 0;
        }
        let i = 0;
        sourceFiles.forEach((file) => {
            let found = false;
            regexes.forEach((regex) => {
                found = found || Boolean(regex.test(file));
            });
            i += found ? 1 : 0;
        });
        return i;
    }
}
exports.default = SourceAnalyzer;
