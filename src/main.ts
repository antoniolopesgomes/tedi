import {Global} from './core';
import {
    UserController,
    AuthController
} from './controllers';

//Config
Global
    //Controllers
    .registerController('UserController', UserController)
    .registerController('AuthController', AuthController)
    //Filters
    //.registerFilter('HTTPFilter', )
    //Services