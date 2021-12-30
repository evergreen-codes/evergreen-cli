"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetchImport = (0, tslib_1.__importStar)(require("isomorphic-unfetch"));
const fetch = (fetchImport.default ||
    fetchImport);
const sleep = (milliseconds) => new Promise((res) => {
    setTimeout(res, milliseconds);
});
class LibrariesIOClient {
    constructor(baseURL = 'https://libraries.io/api', rateLimitWaitTime = 61000) {
        this.baseURL = baseURL;
        this.rateLimitWaitTime = rateLimitWaitTime;
    }
    mapEcosystem(ecosystem) {
        switch (ecosystem) {
            case 'cocoapods':
                return 'cocoapods';
            case 'gradle':
                return 'maven';
            default:
                throw new Error(`Libraries.io client doesn't support ecosystem ${ecosystem}`);
        }
    }
    async getPackageInfo(ecosystem, packageName) {
        let response;
        try {
            response = await fetch(`${this.baseURL}/${this.mapEcosystem(ecosystem)}/${packageName}`);
            const details = await response.json();
            return details;
        }
        catch (error) {
            if (response && response.status === 429) {
                console.log('Hit libraries.io rate limit, waiting...');
                await sleep(this.rateLimitWaitTime);
                return this.getPackageInfo(ecosystem, packageName);
            }
            console.log(error);
            return null;
        }
    }
}
exports.default = LibrariesIOClient;
