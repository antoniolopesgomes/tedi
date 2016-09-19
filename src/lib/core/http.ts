
export interface HttpMethods<T> {
    checkout: T;
    copy: T;
    delete: T;
    get: T;
    head: T;
    lock: T;
    merge: T;
    mkactivity: T;
    mkcol: T;
    move: T;
    mSearch: T;
    notify: T;
    options: T;
    patch: T;
    post: T;
    purge: T;
    put: T;
    report: T;
    search: T;
    subscribe: T;
    trace: T;
    unlock: T;
    unsubscribe: T;
}

export const HTTP_METHODS_NAMES: HttpMethods<string> = {
    checkout: "checkout",
    copy: "copy",
    delete: "delete",
    get: "get",
    head: "head",
    lock: "lock",
    merge: "merge",
    mkactivity: "mkactivity",
    mkcol: "mkcol",
    move: "move",
    mSearch: "m-search",
    notify: "notify",
    options: "options",
    patch: "patch",
    post: "post",
    purge: "purge",
    put: "put",
    report: "report",
    search: "search",
    subscribe: "subscribe",
    trace: "trace",
    unlock: "unlock",
    unsubscribe: "unsubscribe",
};
