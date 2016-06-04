"use strict";
var inversify_1 = require('inversify');
exports.inject = inversify_1.inject;
exports.injectable = inversify_1.injectable;
require('reflect-metadata');
const inversify = require('inversify');
const router_1 = require('./router');
const app_1 = require('./app');
let coreKernel = new inversify.Kernel();
let appKernel = new inversify.Kernel();
(function (BindingContext) {
    BindingContext[BindingContext["SINGLETON"] = 0] = "SINGLETON";
    BindingContext[BindingContext["TRANSIENT"] = 1] = "TRANSIENT";
    BindingContext[BindingContext["VALUE"] = 2] = "VALUE";
})(exports.BindingContext || (exports.BindingContext = {}));
var BindingContext = exports.BindingContext;
class GlobalRegister {
    registerController(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    registerFilter(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    registerErrorHandler(abstraction, concretion, options) {
        bindToKernel(appKernel, abstraction, concretion, options);
        return this;
    }
    registerCoreComponent(abstraction, concretion, options) {
        bindToKernel(coreKernel, abstraction, concretion, options);
        return this;
    }
    getController(abstraction) {
        return appKernel.get(abstraction);
    }
    getFilter(abstraction) {
        return appKernel.get(abstraction);
    }
    getErrorHandler(abstraction) {
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
    .registerCoreComponent('Router', router_1.CoreRouter)
    .registerCoreComponent('App', app_1.ExpressApp)
    .registerCoreComponent('Config', {
    server: {
        port: 8080
    }
}, { context: BindingContext.VALUE });
//# sourceMappingURL=Global.js.map