import {BaseModule, tedi} from "../../core";

describe("Module bindings", () => {

    class SimpleModule extends BaseModule {
        init() { return; }
    }

    describe("when we have a module", () => {
        let module: BaseModule;
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
