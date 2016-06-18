export interface IConfig {
    port: number;
}

const CONFIG_SYMBOL = Symbol('Config');

export class Config {

    static get SYMBOL(): Symbol { return CONFIG_SYMBOL }

    private _value: IConfig;

    constructor(value: IConfig) {
        this._value = value;
    }

    getValue(): IConfig {
        return this._value;
    }

    setValue(value: IConfig) {
        this._value = value;
    }

}