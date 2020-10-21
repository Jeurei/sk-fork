import Vue from 'vue';
import * as Vuex from 'vuex';

import { config } from 'vuex-module-decorators';
config.rawError = true;

Vue.use(Vuex);
export const store = new Vuex.Store({});
