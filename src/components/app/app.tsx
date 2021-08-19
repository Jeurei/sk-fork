import { VNode } from "vue";
import Component from "vue-class-component";
import * as tsx from "vue-tsx-support";
import { latLng, latLngBounds, icon } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LPolyline,
  LIcon,
} from "vue2-leaflet";

import { SkAddressComponent } from "../sk-input-group/SkAddressComponent";
import { SkPhoneComponent } from "../sk-input-group/SkPhoneComponent";
import { SkDestinationComponent } from "../sk-input-group/SkDestinationComponent";
import { SkOrderFormComponent } from "../sk-order-form/SkOrderFormComponent";
import { SkOrderStatusComponent } from "../sk-order-status/SkOrderStatusComponent";
import { Api } from "@api";
import { SkHeaderComponent } from "../sk-header/SkHeaderComponent";
import { skModule, skFormModule, skConfigModule } from "@store";
import { Watch, Provide } from "vue-property-decorator";
import { OrderState, TAddress, TDestination } from "@model";
import {
  SkDialogServiceComponent,
  SkDialogComponent,
} from "../sk-dialog-service/SkDialogService";

export type AppComponentProps = {};

@Component({})
export class AppComponent extends tsx.Component<AppComponentProps> {
  @Provide("getDialogService")
  protected getDialogService() {
    return this.$refs["dialogService"];
  }

  protected leaflet = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "",
    currentZoom: 11.5,
    currentCenter: latLng(47.41322, -1.219482),
    showParagraph: false,
    mapOptions: {
      zoomSnap: 0.5,
    },
    showMap: true,
  };

  protected get orderState() {
    return skModule.skOrderState;
  }

  protected cityCoords: [number, number] | null = null;
  protected get city(): string {
    return skConfigModule.city.name;
  }

  @Watch("city", { immediate: true })
  protected async __onCitySpecified(newCity: string) {
    try {
      let items = await Api.trash.getAddressesLike2(newCity, newCity);
      items = items
        .filter((x) => x.kind === "point")
        .filter((x) => x.coords.lat !== 0 && x.coords.lon !== 0);
      if (items.length > 0) {
        this.cityCoords = [items[0].coords.lat, items[0].coords.lon];
      } else {
        this.cityCoords = null;
      }
    } catch (e) {
      this.cityCoords = null;
    }
  }

  protected get bounds(): [number, number][] {
    let bounds = [...this.getFormBounds(), ...this.getOrderBounds()];

    if (bounds.length > 0) {
      return bounds;
    }

    return skConfigModule.city.boundaries.length > 0
      ? skConfigModule.city.boundaries
      : this.cityCoords
      ? [this.cityCoords]
      : [];
  }

  protected getFormBounds(): [number, number][] {
    if (skModule.skOrderState) {
      return [];
    }

    return [
      // all stops
      ...skFormModule.destinations
        .filter((x) => x.address)
        .map((x) => [x.address!.coords.lat, x.address!.coords.lon]),

      // route
      ...(skFormModule.route
        ? skFormModule.route.full_route_coords.map((x) => [x.lat, x.lon])
        : []),
    ].filter((x) => !(x[0] === 0 && x[1] === 0)) as [number, number][];
  }

  protected getOrderBounds() {
    if (!skModule.skOrderState) {
      return [];
    }

    let routeCoords: [number, number][] = [];
    if (skModule.skRoute) {
      routeCoords = skModule.skRoute.full_route_coords.map((x) => [
        x.lat,
        x.lon,
      ]);
    }

    return [
      // all stops
      [skModule.skOrderState.source_lat, skModule.skOrderState.source_lon],
      [
        skModule.skOrderState.destination_lat,
        skModule.skOrderState.destination_lon,
      ],
      ...skModule.skOrderState.stops.map((x) => [x.lat, x.lon]),

      // route
      ...routeCoords,

      // crew
      ...(skModule.skOrderState.crew_coords
        ? [
            [
              skModule.skOrderState.crew_coords.lat,
              skModule.skOrderState.crew_coords.lon,
            ],
          ]
        : []),
    ].filter((x) => !(x[0] === 0 && x[1] === 0)) as [number, number][];
  }

  protected renderFormObjects() {
    if (skModule.skOrderState) {
      return [];
    }

    return [
      // route
      skFormModule.route ? (
        <LPolyline
          lat-lngs={skFormModule.route.full_route_coords.map((x) => [
            x.lat,
            x.lon,
          ])}
          color="#f00"
        />
      ) : null,

      // all stops
      ...skFormModule.destinations
        .filter(
          (x) =>
            x.address &&
            !(x.address.coords.lat === 0 && x.address.coords.lon === 0)
        )
        .map((x, i) => (
          <LMarker
            key={x.id}
            latLng={latLng(x.address!.coords.lat, x.address!.coords.lon)}
            icon={icon({
              iconUrl:
                i === 0
                  ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" stroke="%23fff" stroke-width="2" fill="%232699fb" /%3E%3C/svg%3E'
                  : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" stroke="%232699fb" stroke-width="2" fill="%23fff" /%3E%3C/svg%3E',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        )),
    ].filter((x) => !!x);
  }

  protected renderOrderObjects() {
    if (!skModule.skOrderState) {
      return [];
    }

    let addresses = [
      {
        key: "source",
        lat: skModule.skOrderState.source_lat,
        lon: skModule.skOrderState.source_lon,
      },
      ...skModule.skOrderState.stops.map((x, i) => ({
        key: `${i}|${x.lat}|${x.lon}`,
        lat: x.lat,
        lon: x.lon,
      })),
      {
        key: "destination",
        lat: skModule.skOrderState.destination_lat,
        lon: skModule.skOrderState.destination_lon,
      },
    ].filter((x) => !(x.lat === 0 && x.lon === 0));

    return [
      // route
      skModule.skRoute ? (
        <LPolyline
          lat-lngs={skModule.skRoute.full_route_coords.map((x) => [
            x.lat,
            x.lon,
          ])}
          color="#f00"
        />
      ) : null,

      // all stops
      ...addresses.map((x, i) => (
        <LMarker
          key={x.key}
          latLng={latLng(x.lat, x.lon)}
          icon={icon({
            iconUrl:
              i === 0
                ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" stroke="%23fff" stroke-width="2" fill="%232699fb" /%3E%3C/svg%3E'
                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" stroke="%232699fb" stroke-width="2" fill="%23fff" /%3E%3C/svg%3E',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />
      )),

      // crew
      skModule.skOrderState.crew_coords ? (
        <LMarker
          latLng={latLng(
            skModule.skOrderState.crew_coords.lat,
            skModule.skOrderState.crew_coords.lon
          )}
          icon={icon({
            iconUrl:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" stroke="%23ff350e" stroke-width="2" fill="%23fff" /%3E%3C/svg%3E',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />
      ) : null,
    ].filter((x) => !!x);
  }

  render(): VNode | null {
    let formObjects = this.renderFormObjects();
    let orderObjects = this.renderOrderObjects();

    return (
      <div class="sk-app">
        <div class="sk-app__panel">
          <SkHeaderComponent
            orderState={this.orderState}
            orderStatus={this.orderState}
          />
          {!this.orderState ? (
            <SkOrderFormComponent style="margin: 10px 0;" />
          ) : (
            <SkOrderStatusComponent
              orderState={this.orderState}
              car={skModule.skCar}
              canChangeOverprice={skModule.canChangeOverprice}
              style="margin: 10px 0;"
            />
          )}

          <SkDialogServiceComponent ref="dialogService" />
        </div>
        <div class="sk-app__map">
          <LMap style="min-height: 300px;" bounds={latLngBounds(this.bounds)}>
            <LTileLayer
              url={this.leaflet.url}
              attribution={this.leaflet.attribution}
            />
            {formObjects}
            {orderObjects}
          </LMap>
        </div>
      </div>
    );
  }
}
