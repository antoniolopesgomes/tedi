#Wiki
For more detailed information, check the [wiki](https://github.com/antoniolopesgomes/tedi/wiki).

[Prepare a **tedi** project](https://github.com/antoniolopesgomes/tedi/wiki/2.-Installation).

##Quick start

###services.ts  
```typescript
import {injectable} from 'tedi/core';
//we will inject this service in the server, don't forget the @injectable() decorator
@injectable()
export class FlowService {
    private _flow: any[] = [];
    add(info: string): void {
        this._flow.push(info);
    }
    readAll(): any[] {
        return this._flow;
    }
}
```

###controllers.ts  
```typescript
import * as express from 'express';
import {injectable} from 'tedi/core';
import {FlowService} from './services';

//we will inject this controller in the server, don't forget the @injectable() decorator
@injectable()
export class CRUDController {
    constructor(
        //di engine will be responsible for intantiating this class
        //and to inject the FlowService dependency
        private _flowService: FlowService
    ) {}
    create(req: express.Request, res: express.Response): void {
        let info = 'CRUDController: create was called';
        this._flowService.add(info);
        res.send(info);
    }
    read(req: express.Request, res: express.Response): void {
        let info = 'CRUDController: read was called';
        this._flowService.add(info);
        res.send(info);
    }
    update(req: express.Request, res: express.Response): void {
        let info = 'CRUDController: update was called';
        this._flowService.add(info);
        res.send(info);
    }
    delete(req: express.Request, res: express.Response): void {
        let info = 'CRUDController: delete was called';
        this._flowService.add(info);
        res.send(info);
    }
}

//we will inject this controller in the server, don't forget the @injectable() decorator
@injectable()
export class InfoController {
    constructor(
        //di engine will be responsible for intantiating this class
        //and to inject the FlowService dependency
        private _flowService: FlowService
    ) {}
    getInfo(req: express.Request, res: express.Response): void {
        res.json({
            info: this._flowService.readAll()
        });
    } 
}
```  
The controller class must be annotated with the **@injectable()** decorator. It will be used by the DI engine during the dependency resolving stage.

###server.ts  
```typescript
import {ExpressServer} from 'tedi/server';
import {Logger, LoggerLevels} from 'tedi/logger';
import {CRUDController, InfoController} from './controllers';
import {FlowService} from './services';

//instantiate a server
let server = new ExpressServer();
//Configure server
server
    .setConfig({
        port: 8080
    })
    .setRoutes({
        "/resources": {
            "/user": {
                "post": ["CRUDController", "create"],
                "put": ["CRUDController", "update"],
                "get": ["CRUDController", "read"],
                "delete": ["CRUDController", "delete"]
            },
            "/info": {
                "get": [InfoController, "getInfo"]
            }
        }
    })
    .setComponent(FlowService)
    //direct dependency class definition
    .setController(InfoController)
    //using string as abstraction for dependency class
    .setController("CRUDController", CRUDController);

//set log level to debug to get some output
//Logger is an internal dependency of the server that you can access
server.component<Logger>('Logger').setLevel(LoggerLevels.DEBUG);
//run
server.run();
```  
```bash
#compile
$ node_modules/.bin/tsc
``` 
Compilation can throw the following errors:  
```bash
node_modules/tedi/lib/modules/Module.d.ts(10,14): error TS1005: '=' expected.
node_modules/tedi/lib/modules/Module.d.ts(10,26): error TS1005: ';' expected.
```  
**You can ignore these errors** or you can update your typescript package:  
```bash
$ npm i typescript@next --save
```  
The next Typescript release (2.0) will solve this issue.

###Run  
```bash
$ node server.js
debug: Server running on port: 8080...
```  
Now you can call:  
**http://localhost:8080/resources/user** with any method (POST, PUT, GET, DELETE)  
Any times you want.  

Then try:  
GET **http://localhost:8080/resources/info**  

You should get (if you called GET two times):  
```json
{"info":["CRUDController: read was called","CRUDController: read was called"]}
```  

##Notes
Has you can see, all server components that we used (services, controllers), are available to each other and 
you can require them in your component constructor 
(be aware of [circular dependencies](http://misko.hevery.com/2008/08/01/circular-dependency-in-constructors-and-dependency-injection/)).  

But there is more! We still need to cover other components that will be useful when building a server.  

Check the [wiki](https://github.com/antoniolopesgomes/tedi/wiki) for more information.  
Check the [tests](https://github.com/antoniolopesgomes/tedi/tree/master/src/test) if you want to understand more about **tedi**.  

You need to have **jasmine** installed to run the tests:  
```bash
$ npm i jasmine -g
$ npm test
```