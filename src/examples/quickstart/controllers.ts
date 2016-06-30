import {Logger, LoggerLevels} from 'tedi/logger';
import {injectable} from 'tedi/core';
import {ExpressServer} from 'tedi/server';
import * as express from 'express';

@injectable()
export class EchoController {
    getEcho(req: express.Request, res: express.Response): void {
        res.send('GET: ' + JSON.stringify(req.params));
    }
}

let expressServer = new ExpressServer();

expressServer
    .setConfig({
        port: 8080
    })
    .setRoutes({
        '/api': {
            '/echo/:id': {
                'get': ['EchoController', 'getEcho']
            }
        }
    })
    .setController('EchoController', EchoController);

let logger = expressServer.component<Logger>('Logger').setLevel(LoggerLevels.DEBUG);

expressServer.run().then(() => {
    logger.info('Server run success!');
})