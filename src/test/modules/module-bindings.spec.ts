import {Module, injectable, IFilter, IErrorHandler} from '../../core';
import * as express from 'express';

describe('Module bindings', () => {

    class SimpleModule extends Module {
        init() { }
    }

    describe('when we have a module', () => {
        let module: Module;
        beforeEach(() => {
            module = new SimpleModule();
        });
        describe('and we register one Controller', () => {
            @injectable()
            class SimpleController { }
            describe('#setComponent(abstraction)', () => {
                beforeEach(() => {
                    module.setController(SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>(SimpleController)).toEqual(jasmine.any(SimpleController));
                });
            });
            describe('#setComponent(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setController(SimpleController, SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>(SimpleController)).toEqual(jasmine.any(SimpleController));
                });
            });
            describe('#setComponent("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setController('SimpleController', SimpleController);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleController>('SimpleController')).toEqual(jasmine.any(SimpleController));
                });
            });
        });
        describe('and we register one Filter', () => {
            @injectable()
            class SimpleFilter implements IFilter<any> {
                apply(req: express.Request, res: express.Response): any { }
                getDataFromRequest(req: express.Request): any { }
            }
            describe('#SimpleFilter(abstraction)', () => {
                beforeEach(() => {
                    module.setFilter(SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>(SimpleFilter)).toEqual(jasmine.any(SimpleFilter));
                });
            });
            describe('#SimpleFilter(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setController(SimpleFilter, SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>(SimpleFilter)).toEqual(jasmine.any(SimpleFilter));
                });
            });
            describe('#SimpleFilter("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setController('SimpleFilter', SimpleFilter);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleFilter>('SimpleFilter')).toEqual(jasmine.any(SimpleFilter));
                });
            });
        });
        describe('and we register one ErrorHandler', () => {
            @injectable()
            class SimpleErrorHandler implements IErrorHandler {
                catch(error: any, req: express.Request, res: express.Response): void { }
            }
            describe('#SimpleErrorHandler(abstraction)', () => {
                beforeEach(() => {
                    module.setErrorHandler(SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>(SimpleErrorHandler)).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
            describe('#SimpleErrorHandler(abstraction, concretion)', () => {
                beforeEach(() => {
                    module.setController(SimpleErrorHandler, SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>(SimpleErrorHandler)).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
            describe('#SimpleErrorHandler("abstraction", concretion)', () => {
                beforeEach(() => {
                    module.setController('SimpleErrorHandler', SimpleErrorHandler);
                });
                it('should have the dependency available', () => {
                    expect(module.component<SimpleErrorHandler>('SimpleErrorHandler')).toEqual(jasmine.any(SimpleErrorHandler));
                });
            });
        });
        describe('and we register one Component', () => {
            @injectable()
            class SimpleComponent {}
            describe('#SimpleComponent(abstraction)', () => {
                beforeEach(() => {
                    module.setComponent(SimpleComponent);
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