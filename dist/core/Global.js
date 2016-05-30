"use strict";
require('reflect-metadata');
const inversify = require('inversify');
const filters_1 = require('./filters');
let ioc = new inversify.Kernel();
let controllerKernel = new inversify.Kernel();
let filterKernel = new inversify.Kernel();
//initial bindings
ioc.bind('FilterManager').to(filters_1.CoreFilterManager);
class GlobalRegister {
    registerController(abstraction, concretion, singleton = true) {
        bindToKernel(controllerKernel, abstraction, concretion, singleton);
        return this;
    }
    registerFilter(abstraction, concretion, singleton = true) {
        bindToKernel(filterKernel, abstraction, concretion, singleton);
        return this;
    }
    getController(abstraction) {
        return controllerKernel.get(abstraction);
    }
    getFilter(abstraction) {
        return controllerKernel.get(abstraction);
    }
}
function bindToKernel(kernel, abstraction, concretion, singleton = true) {
    let binding = kernel.bind(abstraction).to(concretion);
    if (singleton) {
        binding.inSingletonScope();
    }
}
exports.Global = new GlobalRegister();
