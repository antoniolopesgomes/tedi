'use strict';
import {Promise} from '../extensions';

export abstract class App {
    abstract listen(): Promise<any>;
    abstract close(): Promise<any>;
}