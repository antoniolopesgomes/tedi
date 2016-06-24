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
- Controller methods receive express objects as parameters (req, res)
- 'req' and 'res' are pure express objects and you can use them as such.
- Every Server component (Controller, Filter, ErrorHandler, Service) must be decorated with @injectable.
  The dependency injection framework uses this decoration to keep track of the dependencies.
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
    .setController('UserController', UserController);

//Run server
server
    .run()
    .then((httpServer: http.Server) => {
        console.log(`Server running at port ${server.getConfig().port}`);
    });
```

#Filters

You can add filters to any route. Filters are classes that wrap the concept of an express middleware.
They are responsible for changing the state of a request or a reponse, according to it's functionality.
You should avoid sending data from a filter (e.g. res.send()), that's the controller responsability.

##Filter examples

We can make use of the various express middleware modules that already exist:
```javascript
import {injectable, Filter, ExpressUtils} from 'tedi';
//npm install body-parser --save
let bodyParser = require('body-parser');
/* INFO
- Filters must implement the Filter<T> interface.
- Like any other component they must be decorated with @injectable()
*/
@injectable()
class JsonBodyParserFilter implements Filter<any> {
    jsonBodyParser: any = bodyParser.json();
    apply(req: express.Request, res: express.Response): any {
        return ExpressUtils.runMiddleware(jsonBodyParser, req, res);
    }
    //this is an auxiliary method and it's not mandatory
    //it is used to get data from the request that could be added by the apply method
    //as we know the bodyParser middleware adds the body property to the request
    getDataFromRequest(req: express.Request): any {
        return req.body;
    }
}
```
And then you can add it to the server:
```javascript
server
    .setRoutes({
        "$filters": ["JsonBodyParserFilter"],
        "/user": {
            //you could add it here, in this case only this route would be filtered
            //"$filters": ["JsonBodyParserFilter"]
            "post": ["UserController", "create"],
            "get": ["UserController", "read"],
            "put": ["UserController", "update"],
            "delete": ["UserController", "delete"]
        }
    })
    .setFilter("JsonBodyParserFilter", JsonBodyParserFilter)
    .setController('UserController', UserController);
```
If you want a more genreal body parser you can create a scoped filter class:
```javascript
import * as express from 'express';
import {Constructor} from 'tedi/core';
import {Filter, ExpressUtils} from 'tedi';

let bodyParser = require('body-parser');

function BodyParserFilterFactory(type: string, opts: any): Constructor<Filter<any>> {

    let bodyParserMiddleware: any;
    switch(type.toUpperCase()) {
        case 'JSON':
            bodyParserMiddleware = bodyParser.json(opts);
        break;
        case 'RAW':
            bodyParserMiddleware = bodyParser.raw(opts);
        break;
        case 'TEXT':
            bodyParserMiddleware = bodyParser.text(opts);
        break;
        case 'URLENCODED':
            bodyParserMiddleware = bodyParser.urlencoded(opts);
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
```
And use it like this:
```javascript
server
    .setRoutes({
        "/user": {
            "$filters": ["JsonBodyParserFilter"],
            "post": ["UserController", "create"],
            "get": ["UserController", "read"],
            "put": ["UserController", "update"],
            "delete": ["UserController", "delete"]
        }
    })
    .setFilter("JsonBodyParserFilter", BodyParserFilterFactory('json', { inflate: false }))
    .setController('UserController', UserController);
```
Filters are always called in an ascending order, from root to node.
For example:
```javascript
{
    "$filters": ["FirstFilter"],
    "/user": {
        "$filters": ["SecondFilter", "ThirdFilter"],
        "post": ["UserController", "create"],
        "/details": {
            "$filters": ["FourthFilter"]
            "get": ["UserDetailsController", "read"]
        }
    }
}
```
If we call -> GET: /user/details - the component order would be:

FirstFilter -> SecondFilter -> ThirdFilter -> FourthFilter -> UserDetailsController.read

If we call -> POST: /user - the component order would be:

FirstFilter -> SecondFilter -> ThirdFilter -> UserController.create

#Error Handlers

You can add error handlers to any route. ErrorHandlers are classes that wrap the concept of an express middleware
that deals with errors.
They are responsible for managing any error that happened in a filter or controller.

```javascript
import * as express from 'express';
import {injectable, ErrorHandler} from 'tedi';
/* INFO
- ErrorHandlers must implement the ErrorHandler interface.
- Like any other component they must be decorated with @injectable()
*/
@injectable()
class CustomErrorHandler implements ErrorHandler {
    catch(error:any, req: express.Request, res: express.Response): void {
        //deal with the error
        console.log(error);
        res.status(500).send('Error: ' + error.message);
        //if you want the error to bubble up just throw it again
        //throw error;
        //or wrap it in a custom error before bubbling up
        //throw new CustomError(error);
    }
}
```
And then you can add it to the server:
```javascript
server
    .setRoutes({
        "$filters": ["JsonBodyParserFilter"],
        "$errorHandlers": ["RootErrorHandler"],
        "/user": {
            //you could add it here, in this case only the errors of this route will be handled by this ErrorHandler
            //"$errorHandlers": ["RootErrorHandler"]
            "post": ["UserController", "create"],
            "get": ["UserController", "read"],
            "put": ["UserController", "update"],
            "delete": ["UserController", "delete"],
        }
    })
    .setFilter("JsonBodyParserFilter", JsonBodyParserFilter)
    .setController('UserController', UserController)
    .setErrorHandler('RootErrorHandler', CustomErrorHandler);
```
ErrorHandlers are always called in an descending order, from node to root.
For example:
```javascript
{
    "$errorHandlers": ["FirstErrorHandler"],
    "/user": {
        "$errorHandlers": ["SecondErrorHandler", "ThirdErrorHandler"],
        "post": ["UserController", "create"],
        "/details": {
            "$errorHandlers": ["FourthErrorHandler"]
            "get": ["UserDetailsController", "read"]
        }
    }
}
```
If we call -> GET: /user/details - and UserDetailsController.read throws an error, the order will be like this: 

FourthErrorHandler -> ThirdErrorHandler -> SecondErrorHandler -> FirstErrorHandler

It is the responsability of the error handler to deal with the error, so if the FourthErrorHandler threw an an error
the ThirdErrorHandler would be called. If this handler does not rethrow an error then the flow would end here. This
handler would need to send a response back or else the connection would become pending and eventually the client
would disconnect. 

