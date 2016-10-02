import { keys } from "lodash";
import { TediError } from "../core";
import { WebMetadata } from "./metadata";
import { getClassName, HttpMethods, HTTP_METHODS_NAMES } from "../core/utils";

const METADATA_KEY = "tedi:web";

class WebDecoratorError extends TediError {
    constructor(target: Object, methodName: string, err: any) {
        super(`${getClassName(target)}#${methodName}`, err);
    }
}

export interface WebDecorator extends HttpMethods<() => MethodDecorator> {
    $getMetadata: (httpMethodName: string, target: Object) => WebMetadata;
}

function getMetadataKey(httpMethodName: string): string {
    return `${METADATA_KEY}:${httpMethodName}`;
}

function setMetadata(httpMethodName: string, metadata: WebMetadata, target: Object): void {
        Reflect.defineMetadata(getMetadataKey(httpMethodName), metadata, target);
}

function getMetadata(httpMethodName: string, target: Object): WebMetadata {
    return Reflect.getMetadata(getMetadataKey(httpMethodName), target);
}

function WebDecoratorBuilder(httpMethodName: string): () => MethodDecorator {
    return function (): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            if (getMetadata(httpMethodName, target)) {
                throw new WebDecoratorError(target, propertyKey, `duplicate decoration found for @${httpMethodName}`);
            }
            setMetadata(httpMethodName, {
                httpMethodName: httpMethodName,
                methodName: propertyKey,
            }, target);
        };
    };
}

let webDecorator = <WebDecorator> {
    $getMetadata: (httpMethodName: string, target: Object) => getMetadata(httpMethodName, target),
};

keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
    webDecorator[httpMethodName] = WebDecoratorBuilder(httpMethodName);
});

export const web = webDecorator;
