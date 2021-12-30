import { Command } from '@oclif/core';
import { Configuration, Report as ReportType } from '../../types';
export default class Report extends Command {
    static description: string;
    static examples: string[];
    static flags: {};
    static args: never[];
    outputReport(config: Configuration, report: ReportType): Promise<void>;
    run(): Promise<void>;
}
