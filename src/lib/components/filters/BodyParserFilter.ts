import {Filter} from '../../core';
import {Promise} from '../../extensions';
import * as express from 'express';
import * as bodyParser from 'body-parser';

export class BodyParserFilter extends Filter<any> {

    static ParserTypes: any = {
        JSON: 'JSON',
        RAW: 'RAW',
        TEXT: 'TEXT',
        URL_ENCODED: "URL_ENCODED"
    }

    protected _middleware: express.RequestHandler;

    constructor(parserType: string, options?: any) {
        super();
        this._middleware = this.init(parserType, options);
    }

    init(parserType: string, options?: any): express.RequestHandler {
        switch (parserType) {
            case 'JSON':
                return bodyParser.json(options);
            case 'RAW':
                return bodyParser.raw(options);
            case 'TEXT':
                return bodyParser.text(options);
            case 'URL_ENCODED':
                return bodyParser.urlencoded(options);
            default:
                throw new Error(`BodyParserFilter: unknown parserType '${parserType}'`);
        }
    }

    apply(req: express.Request, res: express.Response): any {
        return new Promise((resolve, reject) => {
            this._middleware(req, res, (error?: any) => {
                return error ? reject(error) : resolve();
            })
        })
    }

    getData(req: express.Request, res: express.Response): any {
        return req.body;
    }

}