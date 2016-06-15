import {IModule} from '../Server';

export abstract class Module {
    abstract getRawRouteDefinition(): any;
    abstract registerComponents(server: IModule): void;
}