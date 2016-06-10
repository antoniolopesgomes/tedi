"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./Global'));
class Filter {
    apply(req, res) {
        throw new Error('Filter.apply must be implemented.');
    }
    getData(req, res) {
        throw new Error('Filter.getData must be implemented.');
    }
}
exports.Filter = Filter;
class ErrorHandler {
    catch(error, req, res) {
        throw new Error('ErrorHandler.catch must be implemented.');
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=index.js.map