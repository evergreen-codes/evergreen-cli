// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as readJson from 'read-package-json';
import * as path from 'path';

export function parsePackageJson(packagePath: string): Promise<any> {
  return new Promise((res, rej) => {
    readJson(packagePath, console.error, false, (err: any, data: any) => {
      if (err) {
        rej(err);
        return;
      }

      res(data);
    });
  });
}

export async function getWorkspacePaths(
  projectRoot: string
): Promise<string[]> {
  const rootPackageJson = await parsePackageJson(
    path.join(projectRoot, 'package.json')
  );
  const {
    workspaces: { packages },
  } = rootPackageJson;
  const workspacePaths = packages.map((p: string) => path.join(projectRoot, p));
  return workspacePaths;
}
