"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cocoapods_lockfile_parser_1 = require("@snyk/cocoapods-lockfile-parser");
class CocoaPodsParser {
    getEcosystem() {
        return 'cocoapods';
    }
    async getDependencies(projectRoot) {
        const lockfilePath = `${projectRoot}/Podfile.lock`;
        const parser = await cocoapods_lockfile_parser_1.LockfileParser.readFile(lockfilePath);
        const podfile = parser.toDepGraph().toJSON();
        const dependencies = {};
        for (const pkg of podfile.pkgs) {
            const moreInfo = podfile.graph.nodes.find((node) => node.pkgId === pkg.id);
            const isForked = Boolean(moreInfo &&
                moreInfo.info &&
                moreInfo.info.labels &&
                moreInfo.info.labels.externalSourceGit);
            // Exclude local packages
            if (pkg.info.name !== 'ios' &&
                !(moreInfo &&
                    moreInfo.info &&
                    moreInfo.info.labels &&
                    moreInfo.info.labels.externalSourcePath)) {
                const packageName = pkg.info.name.split('/')[0];
                dependencies[packageName] = {
                    ...pkg.info,
                    version: pkg.info.version || '',
                    ecosystem: this.getEcosystem(),
                    environment: 'application',
                    source: lockfilePath,
                    packageName,
                    isForked,
                };
            }
        }
        return Object.values(dependencies);
    }
}
exports.default = CocoaPodsParser;
