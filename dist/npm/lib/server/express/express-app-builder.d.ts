import * as express from "express";
import { Router } from "../../router";
import { Logger } from "../../logger";
import { BaseModule } from "../../module";
export declare class ExpressAppBuilder {
    private _logger;
    private _router;
    constructor(_logger: Logger, _router: Router);
    buildApp(jsonRoutes: any, module: BaseModule): express.Application;
    private _buildRouting(app, route);
    private _addActions(app, route);
    private _addAction(method, app, routeDefinition);
    private _addFilters(app, route);
    private _addErrorHandlers(app, route);
}
