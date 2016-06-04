"use strict";
const core_1 = require('./core');
const controllers_1 = require('./controllers');
//Config
core_1.Global
    .registerController('UserController', controllers_1.UserController)
    .registerController('AuthController', controllers_1.AuthController);
//Filters
//.registerFilter('HTTPFilter', )
//Services 
//# sourceMappingURL=main.js.map