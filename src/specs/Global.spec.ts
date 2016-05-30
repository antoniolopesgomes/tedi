import {Global} from '../core';
import {inject, injectable} from 'inversify';

describe('Global', () => {

    let abstraction = 'MockController';

    @injectable()
    class MockController {
        id: string = 'mockController';
    }
    
    describe('when I try to register a controller', () => {
        Global.registerController(abstraction, MockController);
        it('should get the registered controller', () => {
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