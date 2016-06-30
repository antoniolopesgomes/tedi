import {injectable} from 'tedi/core';
//we will inject this service in the server, don't forget the @injectable() decorator
@injectable()
export class FlowService {
    private _flow: any[] = [];
    add(info: string): void {
        this._flow.push(info);
    }
    readAll(): any[] {
        return this._flow;
    }
}