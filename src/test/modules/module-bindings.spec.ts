import * as core from "../../core";
import { Injectable } from "../../decorators";

describe("Module bindings", () => {

    describe("when we have a module", () => {
        let module: core.Module;
        beforeEach(() => {
            module = new core.Module();
        });
        describe("and we register a dependency", () => {
            @Injectable()
            class SimpleService { }
            let service: any;
            beforeEach(() => {
                module.setDependency(SimpleService);
                service = module.getDependency(SimpleService);
            });
            it("should gives us the same instance", () => {
                expect(module.getDependency(SimpleService)).toEqual(service);
            });
        });
        // TODO check dependencies options
    });

});
