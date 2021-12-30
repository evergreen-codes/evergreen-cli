declare type AndroixTechManifest = {
    licenses: string | undefined;
    latest_stable_release_number: string | undefined;
    latest_release_published_at: string | undefined;
};
export default class AndroixTechClient {
    baseURL: string;
    constructor(baseURL?: string);
    getPackageInfo(packageName: string): Promise<AndroixTechManifest | null>;
}
export {};
