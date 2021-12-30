import { Configuration, DependencyDetail, Report } from '../types';
export declare function generateReportFromDetails(configuration: Configuration, details: DependencyDetail[]): Report;
export default function generateReport(configuration: Configuration): Promise<Report>;
