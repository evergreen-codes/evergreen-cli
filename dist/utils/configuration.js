"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfiguration = void 0;
const DEFAULT_OUTPUT_DIRECTORY = './report';
const DEFAULT_CRITICALITY_THRESHOLD = 0.97;
const DEFAULT_FRESHNESS_WEIGHT = 0.6;
const DEFAULT_MAINTENENCE_WEIGHT = 0.3;
const DEFAULT_CONSISTENCY_WEIGHT = 0.1;
const DEFAULT_DEVELOPMENT_DISCOUNT = 0.8;
const DEFAULT_CRITICALITY_BUMP = 0.5;
function validateRequiredFields(configuration) {
    if (!configuration.approvedLicenses) {
        throw new Error('A list of approved licenses must be provided');
    }
    if (!process.env.GITHUB_TOKEN) {
        throw new Error('A Github client token must be provided');
    }
    if (!configuration.reports || configuration.reports.length === 0) {
        throw new Error('At least one report configuration must be provided');
    }
}
function validateConfiguration(configuration) {
    var _a, _b, _c, _d, _e;
    validateRequiredFields(configuration);
    return {
        ...configuration,
        githubToken: process.env.GITHUB_TOKEN || '',
        reportOutputDirectory: configuration.reportOutputDirectory || DEFAULT_OUTPUT_DIRECTORY,
        criticialityThreshold: configuration.criticialityThreshold || DEFAULT_CRITICALITY_THRESHOLD,
        weights: {
            freshness: ((_a = configuration.weights) === null || _a === void 0 ? void 0 : _a.freshness) || DEFAULT_FRESHNESS_WEIGHT,
            maintenence: ((_b = configuration.weights) === null || _b === void 0 ? void 0 : _b.maintenence) || DEFAULT_MAINTENENCE_WEIGHT,
            consistency: ((_c = configuration.weights) === null || _c === void 0 ? void 0 : _c.consistency) || DEFAULT_CONSISTENCY_WEIGHT,
            developmentDiscount: ((_d = configuration.weights) === null || _d === void 0 ? void 0 : _d.developmentDiscount) ||
                DEFAULT_DEVELOPMENT_DISCOUNT,
            criticalityBump: ((_e = configuration.weights) === null || _e === void 0 ? void 0 : _e.criticalityBump) || DEFAULT_CRITICALITY_BUMP,
        },
        overrides: configuration.overrides || [],
    };
}
exports.validateConfiguration = validateConfiguration;
