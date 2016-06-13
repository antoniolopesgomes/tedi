import {Server} from './lib/Server';
import {
    UserController,
    AuthController
} from './controllers';

//Config
Server
    //Controllers
    .addController('UserController', UserController)
    .addController('AuthController', AuthController)
    //Filters
    //.registerFilter('HTTPFilter', )
    //Services