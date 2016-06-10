"use strict";
const core_1 = require('./core');
const controllers_1 = require('./controllers');
//Config
core_1.Global
    .addController('UserController', controllers_1.UserController)
    .addController('AuthController', controllers_1.AuthController);
//Filters
//.registerFilter('HTTPFilter', )
//Services 
//# sourceMappingURL=main.js.map