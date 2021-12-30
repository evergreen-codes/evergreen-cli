import { OutOfDateDistance } from '../types';
export declare function versionSatisfiesRanges(version: string, ranges: string): boolean;
export declare function minVersion(versions: string[]): string;
export declare function howOutOfDate(currentVersion: string, latestVersion: string): OutOfDateDistance;
