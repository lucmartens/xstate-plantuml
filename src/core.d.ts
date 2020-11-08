export = visualize;
/**
 * Returns the plantuml syntax for the state machine.
 *
 * @param machine {*}
 * @param options {VisualizeOptions}
 * @returns {string}
 */
declare function visualize(machine: any, options?: VisualizeOptions): string;
declare namespace visualize {
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
