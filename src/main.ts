import {Global} from './lib/Global';
import {
    UserController,
    AuthController
} from './controllers';

//Config
Global
    //Controllers
    .addController('UserController', UserController)
    .addController('AuthController', AuthController)
    //Filters
    //.registerFilter('HTTPFilter', )
    //Services