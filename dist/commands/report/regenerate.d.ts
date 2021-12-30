import Report from '.';
export default class Regenerate extends Report {
    static description: string;
    static examples: string[];
    static flags: {};
    static args: never[];
    run(): Promise<void>;
}
