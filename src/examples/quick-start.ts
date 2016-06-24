import * as express from 'express';
import * as http from 'http';
import {
    injectable,
    Config,
    Filter,
    ExpressUtils,
} from '../lib';
import {Constructor} from '../lib/core';
import {ExpressServer} from '../lib/server';

const bodyParser: any = require('body-parser');

/* INFO
Create a controller class:
'req' and 'res' are pure express objects and you can use them as such.
*/

@injectable()
class UserController {
    create(req: express.Request, res: express.Response) {
        res.status(200).send('create user');
    }
    read(req: express.Request, res: express.Response) {
        res.status(200).send('read user');
    }
    update(req: express.Request, res: express.Response) {
        res.status(200).send('update user');
    }
    delete(req: express.Request, res: express.Response) {
        res.status(200).send('delete user');
    }
}

//FILTERS
@injectable()
class JsonBodyParserFilter implements Filter<any> {
    bodyParser: any = bodyParser.json();
    apply(req: express.Request, res: express.Response): any {
        return ExpressUtils.runMiddleware(bodyParser, req, res);
    }
    getDataFromRequest(req: express.Request): any {
        return req.body;
    }
}

function BodyParserFilterFactory(type: string, opts: any): Constructor<Filter<any>> {

    let bodyParserMiddleware: any;
    switch(type.toUpperCase()) {
        case 'JSON':
            bodyParser.json(opts);
        break;
        case 'RAW':
            bodyParser.raw(opts);
        break;
        case 'TEXT':
            bodyParser.text(opts);
        break;
        case 'URLENCODED':
            bodyParser.urlencoded(opts);
        break;
    }

    @injectable()
    class BodyParserFilter implements Filter<any> {
        apply(req: express.Request, res: express.Response): any {
            return ExpressUtils.runMiddleware(bodyParserMiddleware, req, res);
        }
        getDataFromRequest(req: express.Request): any {
            return req.body;
        }
    }

    return BodyParserFilter;

}

//Create server
let server = new ExpressServer();

//Configure server
server
    .setConfig({
        port: 8080
    })
    .setRoutes({
        "/user": {
            "post": ["UserController", "create"],
            "get": ["UserController", "read"],
            "put": ["UserController", "update"],
            "delete": ["UserController", "delete"],
        }
    })
    .setController('UserController', UserController)

//Run server
server
    .run()
    .then((httpServer: http.Server) => {
        console.log(`Server running at port ${server.getConfig().port}`);
    });