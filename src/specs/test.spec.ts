/*
import {Filter} from '../lib/core';
import {Logger} from '../lib/logging';
import {ExpressAppBuilder} from '../lib/app/express';
import {Server, injectable, inject} from '../lib';
import * as express from 'express';

@injectable()
class CustomFilter extends Filter<any> {
    constructor(logger: Logger) {
        super();
    }
    apply() {
        return 'applied ';
    }
}

fdescribe('asdasd', () => {


    it('should work', () => {

        Server
            .setRoutesDefinition({})
            .addFilter('MockFilter', CustomFilter);
    let f = Server.filter('MockFilter');
    console.log(f.apply.call(f));

})

});
*/