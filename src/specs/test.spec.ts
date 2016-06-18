import {
    Filter,
    Logger,
    LoggerLevels,
    inject,
    injectable,
    Module
} from '../core';
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

    let server = new Module();

    it('should work', () => {

        server.addFilter('MockFilter', qq(1));
        let f = server.filter('MockFilter');
        console.log(f.apply(null, null));

    })

});