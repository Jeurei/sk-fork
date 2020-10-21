import { Module, VuexModule, getModule, Mutation } from 'vuex-module-decorators';

import { CarType, Wish, Overprice, TCity } from '@model';

import { store } from './store';

function sortOverprices(a: Overprice, b: Overprice) {
    if (a.value < b.value) {
        return -1;
    } else if (a.value > b.value) {
        return 1;
    } else {
        return 0;
    }
}

function checkOverpriceExclude(overprice: Overprice, city: TCity) {
    if (!overprice.exclude) {
        return true;
    }

    return !overprice.exclude.some(x => {
        if (x.city && x.city !== city.name) {
            return false;
        }

        if (x.district && x.district !== city.district) {
            return false;
        }

        return true;
    });
}

function checkOverpriceInclude(overprice: Overprice, city: TCity) {
    if (!overprice.include) {
        return true;
    }

    return overprice.include.some(x => {
        if (x.city && x.city !== city.name) {
            return false;
        }

        if (x.district && x.district !== city.district) {
            return false;
        }

        return true;
    });
}

function checkOverpriceFilter(overprice: Overprice, city: TCity) {
    return checkOverpriceExclude(overprice, city) && checkOverpriceInclude(overprice, city);
}

@Module({ dynamic: true, store, name: 'sk-config', namespaced: true })
export class SkConfigModule extends VuexModule {
    public ready: boolean = false;
    public defaultCity: TCity = null as any;
    public city: TCity = null as any;
    public districtCities: TCity[] = [];
    public serverTimezone: number = 0;
    public globalMinPrice: number = 0;

    public carOptions: CarType[] = [];
    public wishOptions: Wish[] = [];
    public overpriceOptionsNotFiltered: Overprice[] = [];
    public overpriceOptionsAfterOrderCreatedNotFiltered: Overprice[] = [];
    public otherOrderParams: number[] = [];

    public get overpriceOptions() {
        return this.overpriceOptionsNotFiltered.filter(x => checkOverpriceFilter(x, this.city));
    }

    public get overpriceOptionsAfterOrderCreated() {
        return this.overpriceOptionsAfterOrderCreatedNotFiltered.filter(x => checkOverpriceFilter(x, this.city));
    }

    public get minPrice() {
        if (this.city.minPrice) {
            return this.city.minPrice;
        }

        return this.globalMinPrice;
    }

    @Mutation
    public setCityOptions({ city, districtCities }: { city: TCity, districtCities: TCity[] }) {
        this.city = city;
        this.defaultCity = city;
        this.districtCities = districtCities;
        this.ready = true;
    }

    @Mutation
    public setCity(city: TCity) {
        this.city = city;
    }

    @Mutation
    public reset() {
        this.city = this.defaultCity;
    }

    @Mutation
    public setConfig(config: {
        carOptions: CarType[],
        wishOptions: Wish[],
        overpriceOptions: Overprice[],
        overpriceOptionsAfterOrderCreated: Overprice[],
        production: boolean,
        serverTimezone: number,
        minPrice: number,
    }) {
        this.serverTimezone = config.serverTimezone;
        this.carOptions = [
            {
                id: 0,
                name: 'Не выбран',
            },
            ...config.carOptions,
        ];
        this.wishOptions = config.wishOptions.slice(0);
        let overpriceOptions = [
            {
                id: 0,
                name: '+0',
                value: 0,
            },
            ...config.overpriceOptions
        ];
        overpriceOptions.sort(sortOverprices);
        this.overpriceOptionsNotFiltered = overpriceOptions;

        let overpriceOptionsAfterOrderCreated = [
            {
                id: 0,
                name: '+0',
                value: 0,
            },
            ...config.overpriceOptionsAfterOrderCreated
        ];
        overpriceOptionsAfterOrderCreated.sort(sortOverprices);
        this.overpriceOptionsAfterOrderCreatedNotFiltered = overpriceOptionsAfterOrderCreated;

        this.globalMinPrice = config.minPrice;

        this.otherOrderParams = config.production ? [] : [78];
    }
}

export const skConfigModule = getModule(SkConfigModule);
