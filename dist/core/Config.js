"use strict";
var _ = require('lodash');
var configRegister = {};
var Config = (function () {
    function Config() {
    }
    Config.register = function (env, config) {
        configRegister[env] = config;
    };
    Config.get = function () {
        return _.cloneDeep({});
    };
    return Config;
}());
