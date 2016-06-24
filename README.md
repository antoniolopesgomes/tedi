#tedi

typescript, express, dependency injection

Comprehensible express wrapper, written in typescript, that uses dependency injection to manage an express server.

##Quick start

```javascript
import * as express from 'express';
import * as http from 'http';
import {injectable,  Config} from 'tedi';
import {ExpressServer} from 'tedi/server';

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
```