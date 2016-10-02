import * as _ from "lodash";
import { HTTP_METHODS_NAMES } from "../../core/utils";
import { web } from "../../decorators";
import { WebMetadata } from "../../decorators/metadata";

describe("web decorators", () => {
    _.keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
        describe(`when we have an @web.${httpMethodName} decorator`, () => {
            class DummyController {
                @(web[httpMethodName])()
                anAction(): string {
                    return httpMethodName.toUpperCase();
                }
            }
            let dummyController: any;
            beforeEach(() => {
                dummyController = new DummyController();
            });
            describe(`${httpMethodName} metadata,`, () => {
                let webMetadata: WebMetadata;
                beforeEach(() => {
                    webMetadata = web.$getMetadata(httpMethodName, dummyController);
                });
                it("should exist", () => {
                    expect(webMetadata).toBeDefined();
                });
                it(`should be valid`, () => {
                    expect(webMetadata.methodName).toEqual("anAction");
                    expect(webMetadata.httpMethodName).toEqual(httpMethodName);
                    expect(dummyController[webMetadata.methodName]()).toEqual(httpMethodName.toUpperCase());
                });
            });
        });
    });
});
