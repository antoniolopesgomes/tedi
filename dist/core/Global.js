"use strict";
var inversify_1 = require('inversify');
exports.inject = inversify_1.inject;
exports.injectable = inversify_1.injectable;
require('reflect-metadata');
const inversify = require('inversify');
const router_1 = require('./router');
const app_1 = require('./app');
const express_1 = require('./app/express');
const logging_1 = require('./logging');
let coreKernel = new inversify.Kernel();
let appKernel = new inversify.Kernel();
(function (BindingContext) {
    BindingContext[BindingContext["SINGLETON"] = 0] = "SINGLETON";
    BindingContext[BindingContext["TRANSIENT"] = 1] = "TRANSIENT";
    BindingContext[BindingContext["VALUE"] = 2] = "VALUE";
})(exports.BindingContext || (exports.BindingContext = {}));
var BindingContext = exports.BindingContext;
class GlobalRegister {
    addController(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    addFilter(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    addErrorHandler(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    registerCoreComponent(abstraction, concretion, options) {
        bindToKernel(coreKernel, abstraction, concretion, options);
        return this;
    }
    controller(abstraction) {
        return appKernel.get(abstraction);
    }
    filter(abstraction) {
        return appKernel.get(abstraction);
    }
    errorHandler(abstraction) {
        return appKernel.get(abstraction);
    }
    getCoreComponent(abstraction) {
        return coreKernel.get(abstraction);
    }
    clear() {
        coreKernel.unbindAll();
        appKernel.unbindAll();
        return this;
    }
    snapshot() {
        coreKernel.snapshot();
        appKernel.snapshot();
        return this;
    }
    restore() {
        coreKernel.restore();
        appKernel.restore();
        return this;
    }
    setAppJSON(value) {
        bindToKernel(coreKernel, 'RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }
}
function bindToKernel(kernel, abstraction, concretion, options = { context: BindingContext.SINGLETON }) {
    switch (options.context) {
        case BindingContext.SINGLETON:
            kernel.bind(abstraction).to(concretion).inSingletonScope();
            break;
        case BindingContext.TRANSIENT:
            kernel.bind(abstraction).to(concretion);
            break;
        case BindingContext.VALUE:
            kernel.bind(abstraction).toConstantValue(concretion);
            break;
        default:
            throwError('Unknown binding context');
            break;
    }
}
function throwError(msg) {
    throw new Error('Global error: ' + msg);
}
exports.Global = new GlobalRegister();
//Default bindings
exports.Global
    .registerCoreComponent(logging_1.Logger, logging_1.WinstonLogger)
    .registerCoreComponent(router_1.Router, router_1.ExpressoRouter)
    .registerCoreComponent(express_1.ExpressAppBuilder, express_1.ExpressAppBuilder)
    .registerCoreComponent(app_1.App, express_1.ExpressApp)
    .registerCoreComponent('Config', {
    server: {
        port: 8080
    }
}, { context: BindingContext.VALUE });
//# sourceMappingURL=Global.js.map