declare const _default: (req: {
    headers: Record<string, string | string[] | undefined>;
    on: (event: string, listener: (chunk: unknown) => void) => /*elided*/ any;
    once: (event: string, listener: () => void) => /*elided*/ any;
}, res: {
    writeHead: {
        (status: number): /*elided*/ any;
        (status: number, headers: Record<string, string>): /*elided*/ any;
    };
    end: (json?: string) => void;
}) => Promise<void>;
export default _default;
//# sourceMappingURL=coduck_bot.d.ts.map