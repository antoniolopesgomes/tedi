import {injectable} from 'tedi/core';
import * as Promise from 'bluebird'
//npm i --save-dev request-promise
const rp = require('request-promise');

export interface FreeGeoIpResponse {
    ip: string,
    country_code: string,
    country_name: string,
    region_code: string,
    region_name: string,
    city: string,
    zip_code: string,
    time_zone: string,
    latitude: Number,
    longitude: Number,
    metro_code: Number
}

@injectable()
export class FreeGeoIpService {
    getIpInfo(ip: string): Promise<FreeGeoIpResponse> {
        return <Promise<FreeGeoIpResponse>> rp(`http://freegeoip.net/json/${ip}`);
    }
}