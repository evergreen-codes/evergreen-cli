"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("./SourceAnalyzer"));
class GradleSourceAnalyzer extends SourceAnalyzer_1.default {
    getEcosystem() {
        return 'gradle';
    }
    getSourceRegexesForPackage(packageName) {
        const [org, artifact] = packageName.split(':');
        const finalOrgPart = org.split('.').pop();
        const firstArtifactPart = artifact.split('-').shift();
        return [
            new RegExp(`import ${artifact}(.| )`, 'mgi'),
            new RegExp(`import ${firstArtifactPart}(.| )`, 'mgi'),
            new RegExp(`import ${finalOrgPart}(.)${firstArtifactPart}`, 'mgi'),
            new RegExp(`import ${finalOrgPart}(.| )`, 'mgi'),
        ];
    }
}
exports.default = GradleSourceAnalyzer;
