"use strict";
const Global_1 = require('./lib/Global');
const controllers_1 = require('./controllers');
//Config
Global_1.Global
    .addController('UserController', controllers_1.UserController)
    .addController('AuthController', controllers_1.AuthController);
//Filters
//.registerFilter('HTTPFilter', )
//Services 
//# sourceMappingURL=main.js.map