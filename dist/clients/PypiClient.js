"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetchImport = (0, tslib_1.__importStar)(require("isomorphic-unfetch"));
const fetch = (fetchImport.default ||
    fetchImport);
class PypiClient {
    constructor(baseURL = 'https://pypi.org/pypi') {
        this.baseURL = baseURL;
    }
    async getPackageInfo(packageName) {
        let response;
        try {
            response = await fetch(`${this.baseURL}/${packageName}/json`);
            const details = await response.json();
            return details;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
}
exports.default = PypiClient;
