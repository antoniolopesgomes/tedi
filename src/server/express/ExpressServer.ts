import {
    Router,
    App,
    Logger,
    Module,
    BindingContext,
    injectable,
    Config
} from '../../core';
import {WinstonLogger} from '../../logging';
import {DefaultRouter} from '../../router/default';
import {ExpressApp} from '../../server/express';

@injectable()
export class ExpressServer extends Module {
    
    constructor() {
        super();
        this
            .addComponent('Server', this, { context: BindingContext.VALUE })
            .addComponent(App, ExpressApp)
            .addComponent(Router, DefaultRouter)
            .addComponent(Logger, WinstonLogger)
            .addComponent(Config, new Config({
                port: 8080
            })
            , { context: BindingContext.VALUE });
    }

}