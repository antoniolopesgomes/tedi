import {
    Filter,
    Logger,
    LoggerLevels,
    Server,
    inject,
    injectable,

} from '../core';
import {ExpressAppBuilder} from '../app/express';
import * as express from 'express';

function qq(cfg: any): any  {
   
    @injectable() class CustomFilter extends Filter<any> {
        constructor(private logger: Logger) {
            super();
        }
        apply() {
            this.logger.setLevel(LoggerLevels.DEBUG);
            this.logger.debug('qweqweqwe');
            return 'applied ' + cfg;
        }
    }

    return CustomFilter;
}

xdescribe('asdasd', () => {

    let server = new Server();

    it('should work', () => {

        server.addFilter('MockFilter', qq(1));
        let f = server.filter('MockFilter');
        console.log(f.apply(null, null));

    })

});