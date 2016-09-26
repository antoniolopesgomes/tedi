import {tedi, Module, Logger} from "../../core";
import {ExpressServer} from "../../express";

describe("inject decorator", () => {

    const WARN_MSG = "This is a warning message";

    @tedi.controller()
    class DummyController {
        constructor(
            @tedi.inject("Logger") private _logger: Logger
        ) { }
        @tedi.controller.get()
        get(): void {
            this._logger.warn(WARN_MSG);
        }
    }

    class DummyModule extends Module {
        init() {
            this
                .setJsonRoutes({
                    "/dummy": {
                        "$controller": DummyController,
                    },
                })
                .dependencies(
                    DummyController
                );
        }
    }

    let server: ExpressServer;

    beforeEach(() => {
        server = new ExpressServer();
        server
            .setJsonRoutes({
                "/api": "DummyModule",
            })
            .setModule("DummyModule", DummyModule);
    });

    describe("when we request the DummyController dependency", () => {
        let dummyController: DummyController;
        let dummyModule: Module;
        beforeEach(() => {
            spyOn(server.getDependency<Logger>("Logger"), "warn");
            dummyModule = server.getDependency<Module>("DummyModule");
            dummyController = dummyModule.getDependency(DummyController);
            dummyController.get();
        });

        it("should exist", () => {
            expect(server.getDependency<Logger>("Logger").warn).toHaveBeenCalledWith(WARN_MSG);
        });
    });
});
