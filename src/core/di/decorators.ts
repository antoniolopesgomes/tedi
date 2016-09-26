import * as inversify from "inversify";
import { DIToken } from "./shared";

export function InjectDecorator(token: DIToken): ParameterDecorator {
    return inversify.inject(token);
}

export function InjectableDecorator(): ClassDecorator {
    return inversify.injectable();
}
