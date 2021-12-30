import * as fs from 'fs';
import * as path from 'path';
import { generateReportFromDetails } from '../../reporter/generateReport';
import { validateConfiguration } from '../../utils/configuration';
import { InputConfiguration, DependencyDetail } from '../../types';
import Report from '.';

export default class Regenerate extends Report {
  static description =
    'Regenerate evergreen report from details.json and configuration';

  static examples = [`$ evergreen report regenerate`];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    const inputConfiguration: InputConfiguration = JSON.parse(
      fs.readFileSync('.evergreenrc.json').toString()
    );
    const configuration = validateConfiguration(inputConfiguration);
    const details: DependencyDetail[] = JSON.parse(
      fs
        .readFileSync(
          path.join(configuration.reportOutputDirectory, 'details.json')
        )
        .toString()
    );

    const report = await generateReportFromDetails(configuration, details);
    await this.outputReport(configuration, report);
  }
}
