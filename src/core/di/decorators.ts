import * as inversify from "inversify";
import { DIToken } from "./core";

export function InjectDecorator<T>(token: DIToken<T>): ParameterDecorator {
    return inversify.inject(token);
}

export function InjectableDecorator(): ClassDecorator {
    return inversify.injectable();
}
