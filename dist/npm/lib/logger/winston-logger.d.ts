import * as winston from "winston";
import { Logger } from "./core";
export declare function WinstonLoggerFactory(cfg?: winston.LoggerOptions): new (...args) => Logger;
