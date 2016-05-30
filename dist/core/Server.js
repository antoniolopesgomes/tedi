"use strict";
class CoreServer {
    constructor(app) {
        this._app = app;
        if (!this._app) {
            throw new Error('Server: Expected application');
        }
    }
    start() {
        return this._app.listen();
    }
    stop() {
        return this._app.close();
    }
}
exports.CoreServer = CoreServer;
