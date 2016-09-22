import * as _ from "lodash";
import { Controller } from "../../core";
import { HTTP_METHODS_NAMES } from "../../http";
import {
    ActionDecoratorError,
    ControllerMetadata,
    ControllerMetadataDescriptor,
    ActionMetadataDescriptor,
} from "../../lib/controller";

describe("Controller", () => {

    describe("@Controller() decorator:", () => {

        describe("when we have a non decorated class", () => {
            class AController { };
            it("metadata should not exist", () => {
                expect(ControllerMetadata.getMetadata(AController)).toBeUndefined();
            });
        });

        describe("when we have a decorated class, without action decorators,", () => {
            @Controller()
            class AController { }
            let ctrlMetadata: ControllerMetadataDescriptor;
            beforeEach(() => {
                ctrlMetadata = ControllerMetadata.getMetadata(AController);
            });
            it("metadata should exist", () => {
                expect(ctrlMetadata).toBeDefined();
                expect(ctrlMetadata.service).toBeDefined();
            });
            it("metadata should have the right class name", () => {
                expect(ctrlMetadata.service.className).toEqual("AController");
            });
        });

    });

    // TODO document this stuff
    _.keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
        describe(`when we have an @Controller.${httpMethodName} decorator`, () => {
            class AController {
                @(Controller[httpMethodName])()
                aMethod(): string {
                    return httpMethodName.toUpperCase();
                }
            }
            let controller: any;

            beforeEach(() => {
                controller = new AController();
            });
            describe(`${httpMethodName} metadata,`, () => {
                let actionMetadata: ActionMetadataDescriptor;
                beforeEach(() => actionMetadata = ControllerMetadata.getActionMetadata(httpMethodName, controller));
                it("should exist", () => expect(actionMetadata).toBeDefined());
                it(`should have the '${httpMethodName}' method name`, () => expect(actionMetadata.methodName).toEqual("aMethod"));
                it(`'${httpMethodName}' method name should be right`, () => expect(controller[actionMetadata.methodName]()).toEqual(httpMethodName.toUpperCase()));
            });
        });
    });

    describe("Invalid decorations:", () => {
        describe("duplicate decorations,", () => {
            let error: any;
            beforeEach(() => {
                try {
                    class AController {
                        @Controller.get()
                        read(): void { return; }

                        @Controller.get()
                        anotherRead(): void { return; }
                    }
                } catch (err) {
                    error = err;
                }
            });
            it("should throw an error", () => {
                expect(error).toEqual(jasmine.any(ActionDecoratorError))
            });
            it("error should have the right message", () => {
                expect(error.message).toEqual("AController#get: Failed to decorate method");
            });
        });

    });
});
