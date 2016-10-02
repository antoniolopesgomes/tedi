import {
    validateModule,
    Module,
    ModuleError,
    TediError,
    dependency,
} from "../../core";
import { getClassName } from "../../core/utils";
import { Injectable, Inject } from "../../decorators";

describe("Module:", () => {
    describe("when we have a valid Module", () => {
        let module: Module;
        beforeEach(() => {
            module = new Module();
        });
        describe("#validateModule", () => {
            it("should validate", () => {
                expect(() => validateModule(module)).not.toThrow();
            });
        });
        describe("and we register a dependency", () => {
            @Injectable()
            class Dependency { }
            describe("using the simple notation", () => {
                let aDependency: any;
                beforeEach(() => {
                    module.setDependency(Dependency);
                    aDependency = module.getDependency(Dependency);
                });
                it("we should get the right instance", () => {
                    expect(aDependency).toEqual(jasmine.any(Dependency));
                });
                it("we should get the same instance every time we ask for one", () => {
                    expect(module.getDependency(Dependency) === aDependency).toBeTruthy();
                });
                describe("and we override the dependency", () => {
                    @Injectable() class OverridedDependency {}
                    beforeEach(() => {
                        module.setDependency(dependency(Dependency, { class: OverridedDependency }));
                    });
                    it("should get an instance of the overrided dependency", () => {
                        expect(module.getDependency(Dependency)).toEqual(jasmine.any(OverridedDependency));
                    });
                });
            });
            describe("using the complex notation", () => {
                let aDependency: any;
                beforeEach(() => {
                    module.setDependency(dependency(Dependency, { class: Dependency}));
                    aDependency = module.getDependency(Dependency);
                });
                it("we should get the right instance", () => {
                    expect(aDependency).toEqual(jasmine.any(Dependency));
                });
                it("we should get the same instance every time we ask for one", () => {
                    expect(module.getDependency(Dependency) === aDependency).toBeTruthy();
                });
                describe("and then we override the dependency token with a new class", () => {
                    @Injectable()
                    class AnotherDependency {}
                    beforeEach(() => {
                        module.setDependency(dependency(Dependency, { class: AnotherDependency }));
                    });
                    it("override should have worked", () => {
                        expect(module.getDependency(Dependency)).toEqual(jasmine.any(AnotherDependency));
                        expect(module.getDependency(Dependency)).not.toEqual(jasmine.any(Dependency));
                    });
                });
            });
            describe("using the complex notation in transient mode", () => {
                let aDependency: any;
                beforeEach(() => {
                    module.setDependency(dependency(Dependency, { class: Dependency, classIsTransient: true}));
                    aDependency = module.getDependency(Dependency);
                });
                it("we should get the right instance", () => {
                    expect(aDependency).toEqual(jasmine.any(Dependency));
                });
                it("we should get a diferent instance every time we ask for one", () => {
                    expect(module.getDependency(Dependency) === aDependency).toBeFalsy();
                });
            });
            describe("that has no Injectable decoration", () => {
                class AnotherDependency {}
                beforeEach(() => {
                    module.setDependency(dependency(Dependency, { class : AnotherDependency }));
                });
                it("should throw a ModuleError", () => {
                    expect(() => module.getDependency(Dependency))
                        .toThrowError(ModuleError, `Module: Error loading dependency for token ${getClassName(Dependency)}`);
                });
            });
            describe("that depends on another dependency", () => {
                @Injectable() class AnotherDependency {
                    constructor(@Inject(Dependency) public dep: any) {}
                }
                beforeEach(() => {
                    module.dependencies(Dependency, AnotherDependency);
                });
                describe("when we load the main dependency", () => {
                    let anotherDependency: AnotherDependency;
                    beforeEach(() => {
                        anotherDependency = module.getDependency(AnotherDependency);
                    });
                    it("should have injected the required dependency", () => {
                        expect(anotherDependency.dep).toEqual(jasmine.any(Dependency));
                    });
                });
            });
        });
        describe("and we register a child module", () => {
            let childModule: Module;
            beforeEach(() => {
                childModule = new Module();
                module.setModule("childModule", childModule);
            });
            describe("and a dependency is registered in the main module", () => {
                @Injectable() class Dependency {}
                beforeEach(() => {
                    module.setDependency(Dependency);
                });
                it("should be accessible from the child module", () => {
                    expect(childModule.getDependency(Dependency)).toEqual(jasmine.any(Dependency));
                });
                describe("and we override the dependency in the child module", () => {
                    @Injectable() class OverridedDependency {}
                    beforeEach(() => {
                        childModule.setDependency(dependency(Dependency, { class: OverridedDependency}));
                    });
                    it("child module should get it's registered dependency", () => {
                        expect(childModule.getDependency(Dependency)).toEqual(jasmine.any(OverridedDependency));
                    });
                });
            });
            describe("a dependency registered in the child module", () => {
                @Injectable() class Dependency {}
                beforeEach(() => {
                    childModule.setDependency(Dependency);
                });
                it("should not be accessible to the main module", () => {
                    expect(() => module.getDependency(Dependency))
                        .toThrowError(ModuleError, `Module: Could not find dependency "${getClassName(Dependency)}" in the module tree`);
                });
            });
        });
    });
    describe("when we have an invalid module", () => {
        let invalidModule: any;
        beforeEach(() => {
            invalidModule = {};
        });
        describe("#validateModule", () => {
            it("should throw an error", (done: DoneFn) => {
                try {
                    validateModule(invalidModule);
                } catch (error) {
                    expect(error).toEqual(jasmine.any(ModuleError));
                    done();
                }
            });
        });
    });
});

describe("ModuleError", () => {
    it("should inherit from TediError", () => {
        expect(new ModuleError({}, "")).toEqual(jasmine.any(TediError));
    });
});
