"use strict";
const Server_1 = require('./lib/Server');
const controllers_1 = require('./controllers');
//Config
Server_1.Server
    .addController('UserController', controllers_1.UserController)
    .addController('AuthController', controllers_1.AuthController);
//Filters
//.registerFilter('HTTPFilter', )
//Services 
//# sourceMappingURL=main.js.map