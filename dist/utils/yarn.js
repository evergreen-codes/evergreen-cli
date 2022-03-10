"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspacePaths = exports.parsePackageJson = void 0;
const tslib_1 = require("tslib");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const read_package_json_1 = (0, tslib_1.__importDefault)(require("read-package-json"));
const path = (0, tslib_1.__importStar)(require("path"));
function parsePackageJson(packagePath) {
    return new Promise((res, rej) => {
        (0, read_package_json_1.default)(packagePath, console.error, false, (err, data) => {
            if (err) {
                rej(err);
                return;
            }
            res(data);
        });
    });
}
exports.parsePackageJson = parsePackageJson;
async function getWorkspacePaths(projectRoot) {
    const rootPackageJson = await parsePackageJson(path.join(projectRoot, 'package.json'));
    const { workspaces: { packages }, } = rootPackageJson;
    const workspacePaths = packages.map((p) => path.join(projectRoot, p));
    return workspacePaths;
}
exports.getWorkspacePaths = getWorkspacePaths;
