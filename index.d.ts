declare module "buffer" {
    export = Buffer;
    class Buffer {
        value: string;
        indentation: number;
        get whitespace(): string;
        indent(): void;
        dedent(): void;
        newline(): void;
        append(value: any): void;
        appendf(strings: any, ...values: any[]): void;
    }
}
declare module "core" {
    export = visualize;
    /**
     * Returns the plantuml syntax for the state machine.
     *
     * @param machine {*}
     * @param options {VisualizeOptions}
     * @returns {string}
     */
    function visualize(machine: any, options?: VisualizeOptions): string;
    namespace visualize {
        export { StateNode, StateNodesConfig, StateSchema, VisualizeOptions };
    }
    type VisualizeOptions = {
        leftToRight?: boolean | undefined;
        skinParams?: string[] | undefined;
        xstate?: any;
    };
    type StateNode = import("xstate/lib/StateNode").StateNode<any, any, import("xstate").EventObject, {
        value: any;
        context: any;
    }>;
    type StateNodesConfig = {
        [x: string]: import("xstate/lib/StateNode").StateNode<any, any, any, {
            value: any;
            context: any;
        }>;
    };
    type StateSchema = import("xstate").StateSchema<any>;
}
