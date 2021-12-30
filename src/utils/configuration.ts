import { Configuration, InputConfiguration } from '../types';

const DEFAULT_OUTPUT_DIRECTORY = './report';
const DEFAULT_CRITICALITY_THRESHOLD = 0.97;
const DEFAULT_FRESHNESS_WEIGHT = 0.6;
const DEFAULT_MAINTENENCE_WEIGHT = 0.3;
const DEFAULT_CONSISTENCY_WEIGHT = 0.1;
const DEFAULT_DEVELOPMENT_DISCOUNT = 0.8;
const DEFAULT_CRITICALITY_BUMP = 0.5;

function validateRequiredFields(configuration: InputConfiguration) {
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

export function validateConfiguration(
  configuration: InputConfiguration
): Configuration {
  validateRequiredFields(configuration);
  return {
    ...configuration,
    githubToken: process.env.GITHUB_TOKEN || '',
    reportOutputDirectory:
      configuration.reportOutputDirectory || DEFAULT_OUTPUT_DIRECTORY,
    criticialityThreshold:
      configuration.criticialityThreshold || DEFAULT_CRITICALITY_THRESHOLD,
    weights: {
      freshness: configuration.weights?.freshness || DEFAULT_FRESHNESS_WEIGHT,
      maintenence:
        configuration.weights?.maintenence || DEFAULT_MAINTENENCE_WEIGHT,
      consistency:
        configuration.weights?.consistency || DEFAULT_CONSISTENCY_WEIGHT,
      developmentDiscount:
        configuration.weights?.developmentDiscount ||
        DEFAULT_DEVELOPMENT_DISCOUNT,
      criticalityBump:
        configuration.weights?.criticalityBump || DEFAULT_CRITICALITY_BUMP,
    },
    overrides: configuration.overrides || [],
  };
}
