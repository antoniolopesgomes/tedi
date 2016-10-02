import { isFunction, isString, isSymbol } from "lodash";
import { Constructor } from "../utils";

export type DIToken<T> = string | symbol | Constructor<T>;

export function getTokenDescription(token: any): string {
    if (isFunction(token)) {
        return (<any> token).name;
    }
    if (isString(token)) {
        return token;
    }
    if (isSymbol(token)) {
        return token.toString();
    }
    return "?";
}
