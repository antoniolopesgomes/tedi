#tedi

typescript, express, dependency injection

Comprehensible express wrapper, written in typescript, that uses dependency injection to manage an express server.

##Quick start

Create a controller class:

```javascript
import {injectable} from 'tedi/core';
import * as express from 'express';

/* INFO
'req' and 'res' are pure express objects and you can use them as such.
*/

@injectable()
class UserController {
    create(req: express.Request, res: express.Response) {
        res.status(200)send('create user');
    }
    read(req: express.Request, res: express.Response) {
        res.status(200)send('read user');
    }
    update(req: express.Request, res: express.Response) {
        res.status(200)send('update user');
    }
    delete(req: express.Request, res: express.Response) {
        res.status(200)send('delete user');
    }
}
```

Create and run a Server:

```javascript
import {ExpressServer} from 'tedi/server/ExpressServer';

let expressServer = null;
let server = new ExpressServer();

server
    .setConfig(new Config({
        port: 8080
    })
    .setRoutesDefinition({
        "/user": {
            "post": ["UserController", "create"],
            "get": ["UserController", "read"],
            "put": ["UserController", "update"],
            "delete": ["UserController", "delete"],
        }
    })
    .setController('UserController', UserController)
    .run()
    .then((server: express.Server) => {
        expressServer = server;
    }
```
