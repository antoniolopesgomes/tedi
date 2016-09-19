import {Controller} from "../../core";
import {ControllerActionDecoratorError, ControllerMetadata} from "../../lib/controller";

describe("Controller decorators", () => {

    describe("Controller decorations", () => {
        describe("when we have a non decorated class", () => {
            class AController { };
            it("should not be decorated", () => {
                expect(ControllerMetadata.isDecoratedWithController(AController)).toBeFalsy();
            });
        });

        describe("when we have a decorated class", () => {
            @Controller() class AController { };
            it("should be decorated", () => {
                expect(ControllerMetadata.isDecoratedWithController(AController)).toBeTruthy();
            });
        });
    });

    describe("Controller actions decorations", () => {
        describe("when we have a valid decoration", () => {
            let controller: any;
            beforeEach(() => {
                @Controller()
                class AController {
                    @Controller.get()
                    read(): string { return "READ"; }

                    @Controller.post()
                    create(): string { return "CREATE"; }

                    @Controller.put()
                    update(): string { return "UPDATE"; }

                    @Controller.delete()
                    delete(): string { return "DELETE"; }
                }
                controller = new AController();
            });
            describe("'get' decoration", () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.getHttpMethodMetadata("get", controller).name;
                });
                it("should have stored the 'get' method name", () => {
                    expect(methodName).toEqual("read");
                });
                it("we should be able to call the 'get' method", () => {
                    expect(controller[methodName]()).toEqual("READ");
                });
            });
            describe("'post' decoration", () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.getHttpMethodMetadata("post", controller).name;
                });
                it("should have stored the POST method name", () => {
                    expect(methodName).toEqual("create");
                });
                it("we should be able to call the POST method", () => {
                    expect(controller[methodName]()).toEqual("CREATE");
                });
            });
            describe("'put' decoration", () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.getHttpMethodMetadata("put", controller).name;
                });
                it("should have stored the 'put' method name", () => {
                    expect(methodName).toEqual("update");
                });
                it("we should be able to call the 'put' method", () => {
                    expect(controller[methodName]()).toEqual("UPDATE");
                });
            });
            describe("'delete' decoration", () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.getHttpMethodMetadata("delete", controller).name;
                });
                it("should have stored the 'delete' method name", () => {
                    expect(methodName).toEqual("delete");
                });
                it("we should be able to call the 'delete' method", () => {
                    expect(controller[methodName]()).toEqual("DELETE");
                });
            });
        });
    });

    describe("Invalid decorations", () => {
        describe("when we have duplicate action decorations", () => {
            let error: any;
            beforeEach(() => {
                try {
                    @Controller()
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
                expect(error).toEqual(jasmine.any(ControllerActionDecoratorError));
            });
        });
    });
});
