import {Server, injectable} from './Server';

describe('Server', () => {

    let abstraction = 'MockController';

    @injectable()
    class MockController {
        id: string = 'mockController';
    }
    
    beforeAll(() => {
        Server.snapshot().clear();
    })
    
    afterAll(() => {
        Server.restore();
    })
    
    describe('when I try to register a controller', () => {
        it('should get the registered controller', () => {
            Server.addController(abstraction, MockController);
            let controller = Server.controller<MockController>('MockController');
            expect(controller).toEqual(jasmine.any(MockController));
            expect(controller.id).toEqual('mockController');

        });

    });
    
    describe('when I try to get a controller', () => {
       describe('and it doesn\'t exist', () => {
          it('should throw a error', () => {
             expect(() => { Server.controller<MockController>('dummy'); })
                .toThrow();
          });
       });
    });

})