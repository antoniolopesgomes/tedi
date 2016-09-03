import * as inversify from "inversify";

describe("inversify", () => {

    describe("child kernel", () => {
        let weaponIdentifier = "Weapon";

        @inversify.injectable()
        class Katana { }

        @inversify.injectable()
        class Shuriken { }

        let parentKernel: inversify.interfaces.Kernel;
        let childKernel: inversify.interfaces.Kernel;

        beforeEach(() => {
            parentKernel = new inversify.Kernel();
            parentKernel.bind(weaponIdentifier).to(Katana);

            childKernel = new inversify.Kernel();
            (<any> childKernel).parent = parentKernel;
        });

        it("should find the dependency", () => {
            expect(childKernel.get(weaponIdentifier)).toEqual(jasmine.any(Katana));
        });

        it("weaponIdentifier should be bound", () => {
            expect(childKernel.isBound(weaponIdentifier)).toBeTruthy();
        });

        describe("when we bind another class with the same identifier to the parentKernel", () => {
            beforeEach(() => {
                parentKernel.bind(weaponIdentifier).to(Shuriken);
            });
            it("an error should be throwned", () => {
                expect(() => parentKernel.get(weaponIdentifier)).toThrow();
            });
        });

        describe("when we bind a class with the same identifier to the child Kernel", () => {
            beforeEach(() => {
                childKernel.bind(weaponIdentifier).to(Shuriken);
            });
            it("childKernel should get the newly bound class", () => {
                expect(childKernel.get(weaponIdentifier)).toEqual(jasmine.any(Shuriken));
            });
            it("parentKernel should have it's own class", () => {
                expect(parentKernel.get(weaponIdentifier)).toEqual(jasmine.any(Katana));
            });
        });
    });
});
