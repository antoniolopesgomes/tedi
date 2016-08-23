"use strict";
function dependency(token, properties) {
    return new DependencyInfo(token, properties);
}
exports.dependency = dependency;
var DependencyInfo = (function () {
    function DependencyInfo(token, properties) {
        this.token = token;
        this.properties = properties || {
            class: token,
        };
    }
    return DependencyInfo;
}());
exports.DependencyInfo = DependencyInfo;
