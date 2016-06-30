import {RouteDefinition, Router} from '../../router';
import {ExpressServer} from '../../server';

describe('route paths', () => {
        let server = new ExpressServer();
        let rootRouteDefinition: RouteDefinition;
        beforeEach(() => {
            server.setRoutes({
                '/one': {
                    '/one': {},
                    '/two': {
                        '/one': {},
                        '/two': {},
                    },
                }
            });
            rootRouteDefinition = server.component<Router>('Router').getRouterRoot();
        });
        describe('/one', () => {
            let routeDefinition: RouteDefinition;
            beforeEach(() => {
                routeDefinition = rootRouteDefinition.children[0];
            })
            it('should have the right path', () => {
                expect(routeDefinition.path).toEqual('/one');
            });
            it('should have the right fullPath', () => {
                expect(routeDefinition.fullPath).toEqual('/one');
            });
        });
        describe('/one/one', () => {
            let routeDefinition: RouteDefinition;
            beforeEach(() => {
                routeDefinition = rootRouteDefinition.children[0].children[0];
            })
            it('should have the right path', () => {
                expect(routeDefinition.path).toEqual('/one');
            });
            it('should have the right fullPath', () => {
                expect(routeDefinition.fullPath).toEqual('/one/one');
            });
        });
        describe('/one/two', () => {
            let routeDefinition: RouteDefinition;
            beforeEach(() => {
                routeDefinition = rootRouteDefinition.children[0].children[1];
            })
            it('should have the right path', () => {
                expect(routeDefinition.path).toEqual('/two');
            });
            it('should have the right fullPath', () => {
                expect(routeDefinition.fullPath).toEqual('/one/two');
            });
        });
        describe('/one/two/one', () => {
            let routeDefinition: RouteDefinition;
            beforeEach(() => {
                routeDefinition = rootRouteDefinition.children[0].children[1].children[0];
            })
            it('should have the right path', () => {
                expect(routeDefinition.path).toEqual('/one');
            });
            it('should have the right fullPath', () => {
                expect(routeDefinition.fullPath).toEqual('/one/two/one');
            });
        });
        describe('/one/two/two', () => {
            let routeDefinition: RouteDefinition;
            beforeEach(() => {
                routeDefinition = rootRouteDefinition.children[0].children[1].children[1];
            })
            it('should have the right path', () => {
                expect(routeDefinition.path).toEqual('/two');
            });
            it('should have the right fullPath', () => {
                expect(routeDefinition.fullPath).toEqual('/one/two/two');
            });
        });
    })