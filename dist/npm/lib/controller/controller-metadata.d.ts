export interface ControllerActionMetadata {
    name: string;
}
export declare class ControllerMetadata {
    static isDecorated(target: Object): boolean;
    static actionMethodName(action: string, target: Object): string;
    static GET(target: Object): ControllerActionMetadata;
    static POST(target: Object): ControllerActionMetadata;
    static DELETE(target: Object): ControllerActionMetadata;
    static PUT(target: Object): ControllerActionMetadata;
}
