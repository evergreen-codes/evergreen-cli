"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetchImport = (0, tslib_1.__importStar)(require("isomorphic-unfetch"));
const node_html_parser_1 = require("node-html-parser");
const fetch = (fetchImport.default ||
    fetchImport);
class AndroixTechClient {
    constructor(baseURL = 'https://androidx.tech/artifacts') {
        this.baseURL = baseURL;
    }
    async getPackageInfo(packageName) {
        var _a, _b;
        let response;
        try {
            const [org, artifact] = packageName.split(':');
            const [, ...orgParts] = org.split('.');
            const subOrg = orgParts.join('.');
            const url = `${this.baseURL}/${subOrg}/${artifact}`;
            response = await fetch(url);
            const details = await response.text();
            const root = (0, node_html_parser_1.parse)(details);
            const anchor = (_a = root
                .querySelectorAll('#content ul')[1]) === null || _a === void 0 ? void 0 : _a.querySelector('a');
            const latestVersion = anchor === null || anchor === void 0 ? void 0 : anchor.textContent;
            const latestReleaseLink = anchor === null || anchor === void 0 ? void 0 : anchor.getAttribute('href');
            let latestReleaseDate = new Date(0).toISOString();
            if (latestReleaseLink) {
                response = await fetch(`${url}/${latestReleaseLink}`);
                const versionDetails = await response.text();
                const root = (0, node_html_parser_1.parse)(versionDetails);
                const p = root.querySelectorAll('#content p')[1];
                latestReleaseDate = (_b = p === null || p === void 0 ? void 0 : p.textContent) === null || _b === void 0 ? void 0 : _b.replace('Release Date: ', '');
            }
            return {
                licenses: 'Apache 2.0',
                latest_stable_release_number: latestVersion || '',
                latest_release_published_at: latestReleaseDate,
            };
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
}
exports.default = AndroixTechClient;
