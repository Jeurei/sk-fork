import { TCustomizableAddress, TCity } from '@model';
import { Api, TmApiError } from '@api';

export class SkAddressCompleteService {
    protected cache: Map<string, Map<string, Promise<TCustomizableAddress[]>>> = new Map();

    constructor() {}

    async find(city: TCity, query: string): Promise<TCustomizableAddress[]> {
        let cityCache = this.cache.get(city.name.toLowerCase());
        if (!cityCache) {
            cityCache = new Map();
            cityCache.set('', Promise.resolve([]));
            this.cache.set(city.name.toLowerCase(), cityCache);
        }

        if (cityCache.has(query)) {
            return cityCache.get(query) as Promise<TCustomizableAddress[]>;
        }

        cityCache.set(
            query,
            (async () => {
                try {
                    let response = await Api.trash.getAddressesLike2(city.name, query);

                    return response.map(x => ({ ...x, isCustom: false as false, citymeta: city }));
                } catch (error) {
                    if (error instanceof TmApiError) {
                        if (error.code === 100) { // Подходящие адреса не найдены
                            return [];
                        }
                    }
                    // cityCache.delete(query);
                    throw error;
                }
            })()
        );
        return cityCache.get(query) as Promise<TCustomizableAddress[]>;
    }

    protected mapCityToAddress(city: TCity): TCustomizableAddress {
        return {
            address_source: 'custom',
            kind: 'point',
            citymeta: city,
            isCustom: false,
            city: city.name,
            street: '',
            house: '',
            point: city.name,
            comment: '',
            coords: { lat: 0, lon: 0 },
        };
    }

    async findInDistrict(city: TCity, districtCities: TCity[], query: string, includeCityOptions: boolean): Promise<TCustomizableAddress[]> {
        let otherDistrictCities = districtCities.filter(x => x.name.toLowerCase() !== city.name.toLowerCase());
        // let foreCities = includeCityOptions ? otherDistrictCities.filter(x => x.name.toLowerCase().indexOf(query.trim().toLowerCase()) === 0) : [];
        // let backCities = includeCityOptions ? otherDistrictCities
        //     .filter(x => foreCities.indexOf(x) === -1)
        //     .filter(x => x.name.toLowerCase().indexOf(query.trim().toLowerCase()) > 0)
        //     : [];
        let addresses = await Promise.all([
            this.find(city, query),
            ...otherDistrictCities.map(x => this.find(x, query)),
        ]);

        addresses = [
            // foreCities.map(x => this.mapCityToAddress(x)),
            ...addresses,
            // backCities.map(x => this.mapCityToAddress(x)),
        ];

        return addresses.reduce((acc, x) => acc.concat(x), []);
    }
}
