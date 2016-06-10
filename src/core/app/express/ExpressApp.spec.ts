import * as request from 'supertest-as-promised';
import * as express from 'express';

xdescribe('Express app', () => {

    let userRouter: express.Router;
    let infoRouter: express.Router;
    let app: express.Application;
    let controller: any;

    beforeEach(() => {
        userRouter = express.Router();
        infoRouter = express.Router();
        app = express();
        controller = {
            fn: (req, res: express.Response, next) => {
                res.status(200).send('ok');
            }
        }
        let controllerWrapper = (req, res, next) => {
            controller.fn(req, res, next);
        }


        infoRouter.route('/').get(controllerWrapper);

        userRouter.route('/').get(controllerWrapper)
        userRouter.use('/info', infoRouter);

        app.use('/user', userRouter);

    })

    describe('when error handlers are chained in the app', () => {
        let response: request.Response;

        beforeEach((done: DoneFn) => {

            app
                .use('/user/info', (err: any, req: any, res: any, next: any) => {
                    err.$handlers.push('info error handler');
                    next(err);
                })
                .use('/user', (err: any, req: any, res: any, next: any) => {
                    err.$handlers.push('user error handler');
                    next(err);
                })
                .use((err: any, req: any, res: any, next: any) => {
                    err.$handlers.push('app error handler');
                    res.status(500).send(err.$handlers);
                });

            spyOn(controller, 'fn').and.callFake((req, res, next) => {
                next({ $handlers: [] });
            })

            request(app)
                .get('/user/info')
                .expect(500)
                .then((res: request.Response) => {
                    response = res;
                    done();
                })
                .catch((error) => done.fail(error))
        })
        it('should have transversed all the error handlers', () => {
            expect(JSON.parse(response.text)).toEqual([
                'info error handler',
                'user error handler',
                'app error handler'
            ]);
        })
    })

    describe('when error handlers are setted in the routers', () => {
        let response: request.Response;
        let infoFlag = false;
        let userFlag = false;
        let rootFlag = false;

        beforeEach((done: DoneFn) => {

            infoRouter.use((err: any, req: any, res: any, next: any) => {
                infoFlag = true;
                next(err);
            })

            userRouter.use((err: any, req: any, res: any, next: any) => {
                userFlag = true;
                next(err);
            })

            app.use((err: any, req: any, res: any, next: any) => {
                rootFlag = true;
                res.status(500).send(err.$handlers);
            });

            spyOn(controller, 'fn').and.callFake((req, res, next) => {
                next(new Error('Custom'));
            })

            request(app)
                .get('/user/info')
                .expect(500)
                .then((res: request.Response) => {
                    response = res;
                    done();
                })
                .catch((error) => done.fail(error))
        })
        it('should have transversed all the error handlers', () => {
            expect(rootFlag).toBeTruthy();
            expect(userFlag).toBeTruthy();
            expect(infoFlag).toBeTruthy();
        })
    })

    describe('when filters are setted in the routers', () => {
        let response: request.Response;
        let infoFlag = false;
        let userFlag = false;
        let rootFlag = false;

        beforeEach((done: DoneFn) => {

            userRouter = express.Router();
            infoRouter = express.Router();
            app = express();
            controller = {
                fn: (req, res: express.Response, next) => {
                    res.status(200).send('ok');
                }
            }
            let controllerWrapper = (req, res, next) => {
                controller.fn(req, res, next);
            }

            
            infoRouter.route('/').get(controllerWrapper);
            
            userRouter.use((req: any, res: any, next: any) => {
                userFlag = true;
                next();
            })
            userRouter.route('/').get(controllerWrapper)
            userRouter.use('/info', infoRouter);
            
            app.use((req: any, res: any, next: any) => {
                rootFlag = true;
                next();
            });
            app.use('/user', userRouter);
            
            infoRouter.use((req: any, res: any, next: any) => {
                infoFlag = true;
                next();
            })
           
            spyOn(controller, 'fn').and.callFake((req, res, next) => {
                res.status(200).send('OK');
            })

            request(app)
                .get('/user/info')
                .expect(200)
                .then((res: request.Response) => {
                    response = res;
                    done();
                })
                .catch((error) => done.fail(error))
        })
        it('should have called root filter', () => {
            expect(rootFlag).toBeTruthy();
        })
        it('should have called user filter', () => {
            expect(userFlag).toBeTruthy();
        })
        it('should have called info filter', () => {
            expect(infoFlag).toBeTruthy();
        })
    })
})