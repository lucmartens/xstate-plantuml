export = visualize;
/**
 * Returns the plantuml syntax for the state machine.
 *
 * @param machine {MachineConfig | StateMachine | StateNode}
 * Either the return value of `xstate.Machine` function or it's first argument.
 * In the second case, `options.xstate` or, if not set `require('xstate')`,
 * is used to create the StateMachine (extends StateNode) instance.
 *
 * @param options {VisualizeOptions}
 * @returns {string}
 */
declare function visualize(machine: import("xstate").MachineConfig<any, any, any> | import("xstate").StateMachine<any, any, any, {
    value: any;
    context: any;
}> | StateNode, options?: VisualizeOptions): string;
declare namespace visualize {
    export { MachineConfig, StateMachine, StateNode, StateNodesConfig, StateSchema, VisualizeOptions };
}
type StateNode = import("xstate/lib/StateNode").StateNode<any, any, import("xstate").EventObject, {
    value: any;
    context: any;
}>;
type VisualizeOptions = {
    leftToRight?: boolean | undefined;
    skinParams?: string[] | undefined;
    xstate?: any;
};
type MachineConfig = import("xstate").MachineConfig<any, any, any>;
type StateMachine = import("xstate").StateMachine<any, any, any, {
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
