"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("./SourceAnalyzer"));
class PipSourceAnalyzer extends SourceAnalyzer_1.default {
    getEcosystem() {
        return 'pip';
    }
    getSourceRegexesForPackage(packageName) {
        return [new RegExp(`from ${packageName.replace(/-/g, '_')}(.| )`, 'mgi')];
    }
}
exports.default = PipSourceAnalyzer;
