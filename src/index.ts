import Vue from 'vue';
import 'vue2-datepicker/locale/ru';
import { Icon } from 'leaflet';

import { AppComponent, AppComponentProps } from './components/app/app';

import { Api } from '@api';
import { skConfigModule } from '@store';
import { TCity } from '@model';

declare function require(_: string): any;
declare function require(_: string[], cb: (...args: any[]) => void): any;
delete (Icon.Default as any).prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

export type SkInitOptions = {
    city: string;
    configUrl?: string;
    config?: any;
};

export const SK = {
    Api: Api,
    init: async function (el: string, options: SkInitOptions, props: AppComponentProps) {
        let config: any = null;
        if (options.config) {
            config = options.config;
        } else if (options.configUrl) {
            config = await (await fetch(options.configUrl)).json();
        } else {
            throw new Error('Invalid init options: no config');
        }

        let cities: TCity[] = config.cities;
        let _city = cities.find(x => x.name.toLowerCase() === options.city.toLowerCase()) || null;
        if (!_city) {
            throw new Error('Invalid city');
        }
        let city = _city;

        if (!city.crewGroupId) {
            throw new Error('crewGroupId not provided');
        }

        if (typeof city.timezone !== 'number') {
            throw new Error('Timezone not provided');
        }

        let boundaries: [number, number][] = [];
        if (city.boundaries instanceof Array) {
            boundaries = city.boundaries;
        }

        let districtCities: TCity[] = [];
        if (city.district) {
            districtCities = cities.filter(x => x.district.toLowerCase() === city.district.toLowerCase());
        }

        skConfigModule.setConfig(config);
        skConfigModule.setCityOptions({
            city,
            districtCities,
        });

        let app = new Vue({
            // store,
            render: (h) => h(AppComponent, { props }),
        }).$mount(el);

        return app;
    }
};

(window as any).SK = SK;
