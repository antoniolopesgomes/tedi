import {injectable, CustomError} from 'tedi/core';
import * as _ from 'lodash';

let heroData = <{[key: string]: any}> require('./data.heroes.json');

@injectable()
export class HeroesDaoService {
    getHero(name: string): any {
        return heroData[name.toLowerCase()];
    }
    updateHero(hero: any): any {
        let _hero = this.getHero(hero.name);
        if (!_hero) {
            throw new HeroServiceError(`Hero '${name}' not found`);
        }
        _.merge(hero, _hero);
        return hero;
    }
    deleteHero(name: string): any {
        let hero = this.getHero(name);
        if (!hero) {
            throw new HeroServiceError(`Hero '${name}' not found`);
        }
        delete heroData[name];
        return hero;
    }
    createHero(hero: any): any {
        let _hero = this.getHero(hero.name);
        if (_hero) {
            throw new HeroServiceError(`An hero named '${name}' already exists`);
        }
        heroData[hero.name.toLowerCase()] = hero;
        return hero;
    }
}

class HeroServiceError extends CustomError { 
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
}