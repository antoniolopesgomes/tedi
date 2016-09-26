import {Module, tedi} from "../../core";

describe("Module bindings", () => {

    class SimpleModule extends Module {
        init() { return; }
    }

    describe("when we have a module", () => {
        let module: Module;
        beforeEach(() => {
            module = new SimpleModule();
        });
        describe("and we register a dependency", () => {
            @tedi.service()
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
