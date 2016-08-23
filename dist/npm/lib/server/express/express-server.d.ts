/// <reference types="es6-promise" />
/// <reference types="node" />
import * as express from "express";
import * as http from "http";
import { BaseModule } from "../../module";
import { Config } from "../../config";
export declare class ExpressServer extends BaseModule {
    private _server;
    private _app;
    constructor();
    init(): void;
    setConfig(config: Config): ExpressServer;
    getConfig(): Config;
    getApp(): express.Application;
    run(): Promise<http.Server>;
    stop(): Promise<any>;
}
