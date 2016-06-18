export interface IConfig {
    port: number;
}

export class Config {

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