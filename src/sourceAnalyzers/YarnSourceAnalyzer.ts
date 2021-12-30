import * as path from 'path';
import * as depcheck from 'depcheck';
import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';
import { getWorkspacePaths } from '../utils/yarn';

export default class YarnSourceAnalyzer extends SourceAnalyzer {
  private usagesCache: Record<string, Record<string, string[]>> = {};

  private async getUsages(
    projectRoot: string
  ): Promise<Record<string, string[]>> {
    if (this.usagesCache[projectRoot]) {
      return this.usagesCache[projectRoot];
    }

    const workspacePaths = await getWorkspacePaths(projectRoot);
    const usages = [];
    const rootUsages = await depcheck(
      path.join(process.cwd(), projectRoot),
      {}
    );
    for await (const workspacePath of workspacePaths) {
      const workspaceUsages = await depcheck(
        path.join(process.cwd(), workspacePath),
        {}
      );
      usages.push(workspaceUsages);
    }

    const using = usages.reduce((prev, curr) => {
      const next = { ...prev };
      Object.keys(curr.using).forEach((dep) => {
        if (!prev[dep]) {
          next[dep] = curr.using[dep];
        } else {
          next[dep] = [...prev[dep], ...curr.using[dep]];
        }
      });
      return next;
    }, rootUsages.using);
    this.usagesCache[projectRoot] = using;
    return using;
  }

  getEcosystem(): Ecosystem {
    return 'yarn';
  }

  getSourceRegexesForPackage(): null {
    return null;
  }

  async countOccurances(
    packageName: string,
    projectRoot: string
  ): Promise<number> {
    const usages = await this.getUsages(projectRoot);
    return (usages[packageName] || []).length;
  }
}
