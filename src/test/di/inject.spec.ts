import { Module, Logger } from "../../core";
import { Injectable, Inject, web } from "../../decorators";
import { ExpressServer } from "../../express";

describe("inject decorator", () => {

    const WARN_MSG = "This is a warning message";

    @Injectable()
    class DummyController {
        constructor(
            @Inject("Logger") private _logger: Logger
        ) { }
        @web.get()
        get(): void {
            this._logger.warn(WARN_MSG);
        }
    }

    class DummyModule extends Module {
        constructor() {
            super();
            this.setJsonRoutes({
                "/dummy": {
                    "$controller": DummyController,
                },
            });
            this.dependencies(DummyController);
        }
    }

    let server: ExpressServer;

    beforeEach(() => {
        server = new ExpressServer();
        server
            .setJsonRoutes({
                "/api": "DummyModule",
            })
            .setModule("DummyModule", new DummyModule());
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
