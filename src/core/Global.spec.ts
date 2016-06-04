import {Global, injectable} from '../core';

describe('Global', () => {

    let abstraction = 'MockController';

    @injectable()
    class MockController {
        id: string = 'mockController';
    }
    
    beforeAll(() => {
        Global.snapshot().clear();
    })
    
    afterAll(() => {
        Global.restore();
    })
    
    describe('when I try to register a controller', () => {
        it('should get the registered controller', () => {
            Global.registerController(abstraction, MockController);
            let controller = Global.getController<MockController>('MockController');
            expect(controller).toEqual(jasmine.any(MockController));
            expect(controller.id).toEqual('mockController');

        });

    });
    
    describe('when I try to get a controller', () => {
       describe('and it doesn\'t exist', () => {
          it('should throw a error', () => {
             expect(() => { Global.getController<MockController>('dummy'); })
                .toThrow();
          });
       });
    });

})