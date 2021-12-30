"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("./SourceAnalyzer"));
class CocoaPodsSourceAnalyzer extends SourceAnalyzer_1.default {
    getEcosystem() {
        return 'cocoapods';
    }
    getSourceRegexesForPackage(packageName) {
        return [new RegExp(`import <?${packageName}`, 'mgi')];
    }
}
exports.default = CocoaPodsSourceAnalyzer;
