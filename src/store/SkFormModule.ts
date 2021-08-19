import Vue from "vue";
import {
  Module,
  VuexModule,
  Action,
  getModule,
  Mutation,
} from "vuex-module-decorators";

import {
  TIncompleteDestination,
  TDestination,
  alterDestinationIds,
  CarType,
  Wish,
  Overprice,
  alterDestinationId,
  TAddress,
  TRoute,
  getAddressId,
  TCustomizableAddress,
} from "@model";
import { Api } from "@api";

import { store } from "./store";
import { skConfigModule } from "./SkConfigModule";
import { skModule } from "./SkModule";
import { Watch } from "vue-property-decorator";

function buildAddress(destination: TDestination | TIncompleteDestination) {
  if (!destination.address) {
    return "";
  }

  let pointStreet = [destination.address.point, destination.address.street]
    .filter((x) => !!x)
    .join(", ");

  let city = "/" + destination.address.city + "/";

  let houseDropoff = [
    destination.address.house,
    destination.dropoff ? `*п ${destination.dropoff}` : "",
  ]
    .filter((x) => !!x)
    .join(", ");

  return [pointStreet + " " + city, houseDropoff].filter((x) => !!x).join(", ");
}

@Module({ dynamic: true, store, name: "sk-form", namespaced: true })
export class SkFormModule extends VuexModule {
  public comment: string = "";

  public destinations: TIncompleteDestination[] = alterDestinationIds([
    {
      address: null,
      dropoff: "",
    },
    {
      address: null,
      dropoff: "",
    },
  ]);

  public route: TRoute<TCustomizableAddress> | null = null;
  public routePromise: Promise<TRoute | null> | null = null;
  // public buildingRoute: boolean = false;
  public tariffId: number = 0;
  public tariffPromise: Promise<number> | null = null;
  // public selectingTariff: boolean = false;
  public price: number = 0;
  public pricePromise: Promise<number> | null = null;

  public phone: string = "";
  public isInDataBase: boolean = true;
  public bonuses: number | null = 0;
  public isBonuses: boolean = false;

  public car: CarType | null = null;

  public wishes: Wish[] = [];

  public useSourceTime: boolean = false;
  public sourceTime: string = (() => {
    let date = new Date();
    date.setMinutes(Math.round(date.getMinutes() / 5) * 5);
    date.setHours(date.getHours() + 1);
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} - ${date.getHours()}:${date.getMinutes()}`.replace(
      /(^|:|[^0-9])([0-9])(?=$|[^0-9])/g,
      "$10$2"
    );
  })();

  public overprice: Overprice | null = null;

  public creatingOrder: boolean = false;

  public get isValidPhone() {
    return /^7\d{10}$/.test(this.phone);
  }

  public get canCreateOrder() {
    if (!this.isValidPhone) {
      return false;
    }

    if (this.destinations.some((x) => x.address === null)) {
      return false;
    }

    if (this.routePromise) {
      return false;
    }

    if (this.tariffPromise) {
      return false;
    }

    if (this.pricePromise) {
      return false;
    }

    if (this.creatingOrder) {
      return false;
    }

    return true;
  }

  public get isAccurateAddresses(): boolean {
    return this.destinations.every(
      (el) => el.address && Object.values(el.address.coords).every(Boolean)
    );
  }

  public get isTelValid(): boolean {
    const PHONE_LENGTH = 11;

    return skFormModule.phone.length === PHONE_LENGTH;
  }

  @Action
  public sendPincode(pin: number): void {
    Api.trash.sendPincode(pin, this.phone);
  }

  @Action
  public async getClientBonuses() {
    const bonuses = await Api.trash.getClientBonuses(this.phone);
    this.setClientBonuses(bonuses);
    this.setIsInDataBase(!!bonuses);
    return bonuses;
  }

  @Mutation
  public setClientBonuses(bonuses: number | null) {
    this.bonuses = bonuses;
  }

  @Mutation
  public setIsInDataBase(value: boolean | null) {
    this.isInDataBase = !!value;
  }

  @Mutation
  public setIsBonuses(value: boolean) {
    this.isBonuses = value;
  }

  @Mutation
  public setDestinations(destinations: TIncompleteDestination[]) {
    if (destinations.length < 2) {
      throw new Error("Destinations could not be fewer than 2");
    }

    this.destinations = destinations;

    if (
      this.destinations[0].address &&
      this.destinations[0].address.citymeta &&
      this.destinations[0].address.citymeta !== skConfigModule.city
    ) {
      skConfigModule.setCity(this.destinations[0].address.citymeta);
    }
  }

  @Mutation
  public addDestination(destination?: TIncompleteDestination) {
    if (!destination) {
      destination = alterDestinationId({
        address: null,
        dropoff: "",
      });
    }

    this.destinations = [...this.destinations, destination];
  }

  @Mutation
  public setPhone(phone: string) {
    this.phone = phone;
  }

  @Mutation
  public setCar(car: CarType | null) {
    this.car = car && car.id ? car : null;
  }

  @Mutation
  public setWishes(wishes: Wish[]) {
    this.wishes = wishes;
  }

  @Mutation
  public setUseSourceTime(useSourceTime: boolean) {
    this.useSourceTime = useSourceTime;
  }

  @Mutation
  public setSourceTime(sourceTime: string | null) {
    this.sourceTime = sourceTime || "";
  }

  @Mutation
  public setOverprice(overprice: Overprice | null) {
    this.overprice = overprice && overprice.id ? overprice : null;
  }

  @Mutation
  public setRoutePromise(routePromise: Promise<TRoute | null> | null) {
    this.routePromise = routePromise;
  }

  @Mutation
  public setRoute(route: TRoute<TCustomizableAddress> | null) {
    this.route = route;
  }

  @Mutation
  public setTariffPromise(promise: Promise<number> | null) {
    this.tariffPromise = promise;
  }

  @Mutation
  public setTariffId(tariffId: number) {
    this.tariffId = tariffId;
  }

  @Mutation
  public setPrice(price: number) {
    this.price = price;
  }

  @Mutation
  public setPricePromise(promise: Promise<number> | null) {
    this.pricePromise = promise;
  }

  @Mutation
  public setCreatingOrder(creatingOrder: boolean) {
    this.creatingOrder = creatingOrder;
  }

  @Mutation
  public setComment(comment: string) {
    this.comment = comment;
  }

  @Action
  public async clear() {
    this.setDestinations(
      alterDestinationIds([
        {
          address: null,
          dropoff: "",
        },
        {
          address: null,
          dropoff: "",
        },
      ])
    );
    document.cookie = "bonuses=false";
    this.setPhone("");
    this.setIsInDataBase(false);
    this.setIsBonuses(false);
    this.setClientBonuses(null);
    this.setCar(null);
    this.setWishes([]);
    this.setUseSourceTime(false);
    this.setSourceTime(
      (() => {
        let date = new Date();
        date.setMinutes(Math.round(date.getMinutes() / 5) * 5);
        date.setHours(date.getHours() + 1);
        return `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()} - ${date.getHours()}:${date.getMinutes()}`.replace(
          /(^|:|[^0-9])([0-9])(?=$|[^0-9])/g,
          "$10$2"
        );
      })()
    );
    this.setOverprice(null);
    this.setComment("");
  }

  @Action
  public async createOrder() {
    if (!this.isValidPhone) {
      console.error("Phone is not valid:" + this.phone);
      return;
    }

    if (!this.canCreateOrder) {
      return;
    }

    let phone = "8" + this.phone.replace(/7(\d{10})/, "$1");

    if (this.destinations.some((x) => !x.address)) {
      console.error("Addresses is not valid");
      return;
    }

    let destinations: TDestination[] = this.destinations as TDestination[];

    let date = new Date();
    if (this.useSourceTime) {
      let matches = /^(\d{4})-(\d{2})-(\d{2}) - (\d{2}):(\d{2})$/.exec(
        this.sourceTime
      );
      if (!matches) {
        console.error("Invalid date");
        return;
      }

      date = new Date(
        parseInt(matches[1], 10),
        parseInt(matches[2], 10) - 1,
        parseInt(matches[3], 10),
        parseInt(matches[4], 10),
        parseInt(matches[5], 10),
        0
      );
    }

    let offset = Math.floor(
      skConfigModule.serverTimezone - skConfigModule.city.timezone
    );
    date.setHours(date.getHours() + offset);

    let dateStr = [
      `${date.getFullYear()}`,
      `${date.getMonth() + 1}`.replace(/^(\d)$/, "0$1"),
      `${date.getDate()}`.replace(/^(\d)$/, "0$1"),
      `${date.getHours()}`.replace(/^(\d)$/, "0$1"),
      `${date.getMinutes()}`.replace(/^(\d)$/, "0$1"),
      `${date.getSeconds()}`.replace(/^(\d)$/, "0$1"),
    ].join("");

    let orderId;
    try {
      this.setCreatingOrder(true);
      orderId = await Api.trash.createOrder2({
        phone: phone,
        addresses: this.route
          ? this.route.addresses.map((x, i) => ({
              address: buildAddress(this.destinations[i]),
              lat: x.address.coords.lat,
              lon: x.address.coords.lon,
              parking_id: x.info.parkingId,
              zone_id: x.info.zoneId,
            }))
          : destinations.map((x) => ({
              address: buildAddress(x),
              lat: x.address.coords.lat,
              lon: x.address.coords.lon,
              parking_id: 0,
              zone_id: 0,
            })),
        order_params: [
          ...(this.car ? [this.car.id] : []),
          ...this.wishes.map((x) => x.id),
          ...(this.overprice ? [this.overprice.id] : []),
          ...skConfigModule.otherOrderParams,
        ],
        comment: this.comment,
        server_time_offset:
          skConfigModule.city.timezone - skConfigModule.serverTimezone,
        source_time: dateStr,
        is_prior: this.useSourceTime,
        crew_group_id: skConfigModule.city.crewGroupId,
        ...(this.tariffId > 0
          ? {
              tariff_id: this.tariffId,
            }
          : {}),
      });
    } finally {
      this.setCreatingOrder(false);
    }

    skModule.skSetOrder(orderId);
  }

  @Action
  public async updateRoute() {
    let promise = (async () => {
      let nullableAddresses = this.destinations.map((x) => x.address);
      if (nullableAddresses.some((x) => !x)) {
        return null;
      }

      let addresses = nullableAddresses as TCustomizableAddress[];
      return await Api.trash.analyzeRoute2(addresses, true);
    })();

    this.setRoute(null);
    this.setRoutePromise(promise);

    let route = null;
    try {
      route = await promise;
    } finally {
      if (this.routePromise === promise) {
        this.setRoute(route);
        this.setRoutePromise(null);
      }
    }

    return route;
  }

  @Action
  public async updateTariff() {
    let promise = (async () => {
      let route = this.route;
      let crewGroupId = skConfigModule.city.crewGroupId;

      let coords;
      if (route) {
        coords = route.addresses.map((x) => x.address.coords);
      } else {
        let addresses = this.destinations
          .map((x) => x.address)
          .filter((x) => !!x) as TAddress[];
        if (addresses.length < 2) {
          return 0;
        }
        coords = addresses.map((x) => x.coords);
      }

      return await Api.trash.selectTariffForOrder(crewGroupId, coords);
    })();

    this.setTariffId(0);
    this.setTariffPromise(promise);

    let tariffId = 0;
    try {
      tariffId = await promise;
    } finally {
      if (this.tariffPromise === promise) {
        this.setTariffId(tariffId);
        this.setTariffPromise(null);
      }
    }

    return tariffId;
  }

  @Action
  public async updatePrice() {
    let promise = (async () => {
      let route = this.route;
      let tariffId = this.tariffId;

      let orderParams = [
        ...(this.car ? [this.car.id] : []),
        ...this.wishes.map((x) => x.id),
        ...(this.overprice ? [this.overprice.id] : []),
        ...skConfigModule.otherOrderParams,
      ];

      if (route) {
        return await Api.trash.calcOrderCost2(tariffId, route, orderParams);
      } else {
        let addresses = this.destinations
          .map((x) => x.address)
          .filter((x) => !!x) as TAddress[];
        if (addresses.length < 2) {
          return 0;
        }
        return await Api.trash.calcOrderCost2WithoutRoute(
          tariffId,
          addresses,
          orderParams
        );
      }
    })();

    this.setPrice(0);
    this.setPricePromise(promise);

    let sum = 0;
    try {
      sum = await promise;
    } finally {
      if (this.pricePromise === promise) {
        this.setPrice(sum);
        this.setPricePromise(null);
      }
    }

    return sum;
  }
}

export const skFormModule = getModule(SkFormModule);

store.watch(
  () =>
    skFormModule.destinations
      .map((x) => x.address)
      .map((x) => (x ? getAddressId(x) : "null"))
      .join("\n"),
  () => {
    skFormModule.updateRoute();
  },
  {
    immediate: true,
  }
);

store.watch(
  () => {
    if (!skConfigModule.ready) {
      return "";
    }

    let route = skFormModule.route;
    let crewGroupId = skConfigModule.city.crewGroupId;

    let coords;
    if (route) {
      coords = route.addresses.map((x) => x.address.coords);
    } else {
      let addresses = skFormModule.destinations
        .map((x) => x.address)
        .filter((x) => !!x) as TAddress[];
      if (addresses.length < 2) {
        coords = [];
      }
      coords = addresses.map((x) => x.coords);
    }

    let flatCoords: number[] = [];
    coords.forEach((x) => flatCoords.push(x.lat, x.lon));

    return [crewGroupId, ...flatCoords].join("\n");
  },
  () => {
    if (skConfigModule.ready) {
      skFormModule.updateTariff();
    }
  },
  {
    immediate: true,
  }
);

store.watch(
  () => {
    if (!skConfigModule.ready) {
      return "";
    }

    let route = skFormModule.route;
    let crewGroupId = skConfigModule.city.crewGroupId;
    let tariffId = skFormModule.tariffId;

    let orderParams = [
      ...(skFormModule.car ? [skFormModule.car.id] : []),
      ...skFormModule.wishes.map((x) => x.id),
      ...(skFormModule.overprice ? [skFormModule.overprice.id] : []),
      ...skConfigModule.otherOrderParams,
    ];
    orderParams.sort();
    let orderParamsKey = orderParams.join(",");

    let routeKey;
    if (route) {
      let coords = route.addresses.map((x) => x.address.coords);
      routeKey = coords.map((x) => `[${x.lat},${x.lon}]`).join(",");
    } else {
      let addresses = skFormModule.destinations
        .map((x) => x.address)
        .filter((x) => !!x) as TCustomizableAddress[];
      if (addresses.length < 2) {
        routeKey = "";
      } else {
        routeKey = addresses.map((x) => getAddressId(x)).join(",");
      }
    }

    return [crewGroupId, tariffId, routeKey, orderParamsKey].join("\n");
  },
  () => {
    if (skConfigModule.ready) {
      skFormModule.updatePrice();
    }
  },
  {
    immediate: true,
  }
);

store.watch(
  () => skModule.skOrderId,
  () => {
    // skFormModule.clear();
    skConfigModule.reset();
  },
  {
    immediate: false,
    deep: false,
  }
);

store.watch(
  () => skConfigModule.overpriceOptions,
  () => {
    if (skFormModule.overprice == null) {
      return;
    }

    let overprice = skFormModule.overprice;
    if (!skConfigModule.overpriceOptions.some((x) => x.id === overprice.id)) {
      skFormModule.setOverprice(null);
    }
  },
  {
    immediate: false,
    deep: false,
  }
);
