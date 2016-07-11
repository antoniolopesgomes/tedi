import {BaseModule, Controller, Filter, ErrorHandler, BaseFilter, BaseErrorHandler} from '../../core';
import * as express from 'express';

describe('Module bindings', () => {

    class SimpleModule extends BaseModule {
        init() { }
    }

    describe('when we have a module', () => {
        let module: BaseModule;
        beforeEach(() => {
            module = new SimpleModule();
        });
        describe('and we register one Controller', () => {
            @Controller()
            class SimpleController { }
            describe('#setController(abstraction)', () => {
                beforeEach(() => {
                    module.setController(SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>(SimpleController)).toEqual(jasmine.any(SimpleController));
                });
            });
            describe('#setController(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setController(SimpleController, SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>(SimpleController)).toEqual(jasmine.any(SimpleController));
                });
            });
            describe('#setController("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setController('SimpleController', SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>('SimpleController')).toEqual(jasmine.any(SimpleController));
                });
            });
        });
        describe('and we register one Filter', () => {
            @Filter()
            class SimpleFilter implements BaseFilter<any> {
                apply(req: express.Request, res: express.Response): any { }
                getDataFromRequest(req: express.Request): any { }
            }
            describe('#setFilter(abstraction)', () => {
                beforeEach(() => {
                    module.setFilter(SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>(SimpleFilter)).toEqual(jasmine.any(SimpleFilter));
                });
            });
            describe('#setFilter(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setFilter(SimpleFilter, SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>(SimpleFilter)).toEqual(jasmine.any(SimpleFilter));
                });
            });
            describe('#setFilter("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setFilter('SimpleFilter', SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>('SimpleFilter')).toEqual(jasmine.any(SimpleFilter));
                });
            });
        });
        describe('and we register one ErrorHandler', () => {
            @ErrorHandler()
            class SimpleErrorHandler implements BaseErrorHandler {
                catch(error: any, req: express.Request, res: express.Response): void { }
            }
            describe('#setErrorHandler(abstraction)', () => {
                beforeEach(() => {
                    module.setErrorHandler(SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>(SimpleErrorHandler)).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
            describe('#setErrorHandler(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setErrorHandler(SimpleErrorHandler, SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>(SimpleErrorHandler)).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
            describe('#setErrorHandler("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setErrorHandler('SimpleErrorHandler', SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>('SimpleErrorHandler')).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
        });
        describe('and we register one Component', () => {
            @Controller()
            class SimpleComponent {}
            describe('#SimpleComponent(abstraction)', () => {
                beforeEach(() => {
                    module.setService(SimpleComponent);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleComponent>(SimpleComponent)).toEqual(jasmine.any(SimpleComponent));
                });
            });
            describe('#SimpleComponent(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setController(SimpleComponent, SimpleComponent);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleComponent>(SimpleComponent)).toEqual(jasmine.any(SimpleComponent));
                });
            });
            describe('#SimpleComponent("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setController('SimpleComponent', SimpleComponent);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleComponent>('SimpleComponent')).toEqual(jasmine.any(SimpleComponent));
                });
            });
        });
    })

});