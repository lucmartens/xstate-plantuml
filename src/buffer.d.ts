export = Buffer;
declare class Buffer {
    value: string;
    indentation: number;
    get whitespace(): string;
    indent(): void;
    dedent(): void;
    newline(): void;
    append(value: any): void;
    appendf(strings: any, ...values: any[]): void;
}
