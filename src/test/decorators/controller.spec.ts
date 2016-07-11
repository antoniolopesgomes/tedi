import {Controller, Module} from '../../core';
import {ControllerActionDecoratorError, ControllerMetadata} from '../../lib/controller';

describe('Controller decorators', () => {

    describe('Controller decorations', () => {
        describe('when we have a non decorated class', () => {
            class AController { };
            it('should not be decorated', () => {
                expect(ControllerMetadata.isPresent(AController)).toBeFalsy();
            });
        });

        describe('when we have a decorated class', () => {
            @Controller() class AController { };
            it('should be decorated', () => {
                expect(ControllerMetadata.isPresent(AController)).toBeTruthy();
            });
        });
    });

    describe('Controller actions decorations', () => {
        describe('when we have a valid decoration', () => {
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
            describe('GET decoration', () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.GETMethodName(controller);
                });
                it('should have stored the GET method name', () => {
                    expect(methodName).toEqual('read');
                });
                it('we should be able to call the GET method', () => {
                    expect(controller[methodName]()).toEqual('READ');
                })
            });
            describe('POST decoration', () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.POSTMethodName(controller);
                });
                it('should have stored the POST method name', () => {
                    expect(methodName).toEqual('create');
                });
                it('we should be able to call the POST method', () => {
                    expect(controller[methodName]()).toEqual('CREATE');
                });
            });
            describe('PUT decoration', () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.PUTMethodName(controller);
                });
                it('should have stored the PUT method name', () => {
                    expect(methodName).toEqual('update');
                });
                it('we should be able to call the PUT method', () => {
                    expect(controller[methodName]()).toEqual('UPDATE');
                });
            });
            describe('DELETE decoration', () => {
                let methodName: string;
                beforeEach(() => {
                    methodName = ControllerMetadata.DELETEMethodName(controller);
                });
                it('should have stored the DELETE method name', () => {
                    expect(methodName).toEqual('delete');
                });
                it('we should be able to call the DELETE method', () => {
                    expect(controller[methodName]()).toEqual('DELETE');
                });
            });
        });
    });

    describe('Invalid decorations', () => {
        describe('when we have duplicate action decorations', () => {
            let error: any;
            beforeEach(() => {
                try {
                    @Controller()
                    class AController {

                        @Controller.get()
                        read(): void { }

                        @Controller.get()
                        anotherRead(): void { }
                    }
                }
                catch (err) {
                    error = err;
                }
            });
            it('should throw an error', () => {
                expect(error).toEqual(jasmine.any(ControllerActionDecoratorError));
            });
        });
    });
});