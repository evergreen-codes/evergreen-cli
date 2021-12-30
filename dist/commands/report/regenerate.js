"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = (0, tslib_1.__importStar)(require("fs"));
const path = (0, tslib_1.__importStar)(require("path"));
const generateReport_1 = require("../../reporter/generateReport");
const configuration_1 = require("../../utils/configuration");
const _1 = (0, tslib_1.__importDefault)(require("."));
class Regenerate extends _1.default {
    async run() {
        const inputConfiguration = JSON.parse(fs.readFileSync('.evergreenrc.json').toString());
        const configuration = (0, configuration_1.validateConfiguration)(inputConfiguration);
        const details = JSON.parse(fs
            .readFileSync(path.join(configuration.reportOutputDirectory, 'details.json'))
            .toString());
        const report = await (0, generateReport_1.generateReportFromDetails)(configuration, details);
        await this.outputReport(configuration, report);
    }
}
exports.default = Regenerate;
Regenerate.description = 'Regenerate evergreen report from details.json and configuration';
Regenerate.examples = [`$ evergreen report regenerate`];
Regenerate.flags = {};
Regenerate.args = [];
