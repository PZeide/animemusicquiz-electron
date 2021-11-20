export {};

declare global {
    interface Window {
        app: {
            config: {
                get(path: string): unknown;
                set(path: string, value: unknown): void;
            };

            utils: {
                openCustomStyleFile(): void;
            }
        }
    }
}