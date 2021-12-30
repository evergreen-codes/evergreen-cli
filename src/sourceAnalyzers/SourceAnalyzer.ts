import * as fs from 'fs';
import * as glob from 'glob';
import { Ecosystem } from '../types';

export default abstract class SourceAnalyzer {
  sourceCache: Record<string, string[]> = {};

  abstract getEcosystem(): Ecosystem;

  abstract getSourceRegexesForPackage(packageName: string): RegExp[] | null;

  private getSource(projectRoot: string, sourceGlob: string): string[] {
    const cacheKey = `${projectRoot}-${sourceGlob}`;
    if (this.sourceCache[cacheKey]) {
      return this.sourceCache[cacheKey];
    }

    const sourceFiles: string[] = [];
    const files = glob.sync(sourceGlob);
    files.forEach((file: string) => {
      sourceFiles.push(fs.readFileSync(file).toString());
    });
    this.sourceCache[cacheKey] = sourceFiles;
    return sourceFiles;
  }

  async countOccurances(
    packageName: string,
    projectRoot: string,
    sourceGlob: string
  ): Promise<number> {
    const sourceFiles = this.getSource(projectRoot, sourceGlob);
    const regexes = this.getSourceRegexesForPackage(packageName);
    if (!regexes) {
      return 0;
    }

    let i = 0;
    sourceFiles.forEach((file) => {
      let found = false;
      regexes.forEach((regex) => {
        found = found || Boolean(regex.test(file));
      });
      i += found ? 1 : 0;
    });
    return i;
  }
}
