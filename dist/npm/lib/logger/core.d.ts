export declare enum LoggerLevels {
    EMERGENCY = 0,
    ALERT = 1,
    CRITICAL = 2,
    ERROR = 3,
    WARNING = 4,
    NOTICE = 5,
    INFO = 6,
    DEBUG = 7,
}
export interface Logger {
    warn(msg: string): void;
    info(msg: string): void;
    error(msg: string, err: any): void;
    debug(msg: any): void;
    setLevel(leven: LoggerLevels): Logger;
}
