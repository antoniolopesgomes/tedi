
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
    "m-search": T;
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

export const HTTP_METHODS: string[] = [
    "checkout",
    "copy",
    "delete",
    "get",
    "head",
    "lock",
    "merge",
    "mkactivity",
    "mkcol",
    "move",
    "m-search",
    "notify",
    "options",
    "patch",
    "post",
    "purge",
    "put",
    "report",
    "search",
    "subscribe",
    "trace",
    "unlock",
    "unsubscribe",
];
