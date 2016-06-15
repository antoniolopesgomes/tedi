import {IServerRegistry} from '../Server';

export abstract class Module {
    abstract getRawRouteDefinition(): any;
    abstract registerComponents(server: IServerRegistry): void;
}