import Component from "vue-class-component";
import * as tsx from "vue-tsx-support";
import { SkOrderStatusRouteComponent } from "./SkOrderStatusRouteComponent";
import { SkOrderStatusStateComponent } from "./SkOrderStatusStateComponent";
import { SkPriceComponent } from "../sk-price/SkPriceComponent";
import { SkOrderStatusControlsComponent } from "./SkOrderStatusControlsComponent";
import { OrderState, Overprice, Car } from "@model";
import { Prop } from "vue-property-decorator";
import { skModule, skConfigModule, skFormModule } from "@store";
import { SkDialogComponent } from "../sk-dialog-service/SkDialogService";
import { SkIconWarning } from "../icons/SkIconWarning";
import { SkMultiselect } from "../sk-input-group/SkMultiselect";
import { SkIconUpdown } from "../icons/SkIconUpdown";
import { SkOrderFormBonuses } from "../sk-order-form/SkOrderFormBonuses";

export type SkOrderStatusComponentProps = {
  orderState: OrderState;
};

export type Option<T> = {
  id: string;
  value: T;
  $isDisabled: boolean;
};

@Component({})
export class SkOrderStatusComponent extends tsx.Component<SkOrderStatusComponentProps> {
  protected bonuses = null;
  @Prop()
  public orderState!: OrderState;

  @Prop()
  public car!: Car | null;

  @Prop()
  public canChangeOverprice!: boolean;
  //Хак для автофокуса при переключении с формы ввода адреса на форму отслеживания статуса
  //13.10.2020 Praweb
  getCookie(name: string) {
    var matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
  public async mounted() {
    console.log("mounted");
    let elem = document.getElementsByClassName(
      "sk-order-status__overprice-select"
    )[0];
    (elem as HTMLElement)?.focus();

    if (document.cookie.includes("bonuses=true")) {
      const phone = this.getCookie("phone");
      skFormModule.setPhone(phone!);
      skFormModule.setIsBonuses(true);
      await skFormModule.getClientBonuses();
    }
  }

  protected get addresses() {
    let addresses = [
      {
        address: this.orderState.source,
        done: true,
      },
    ];

    this.orderState.stops.forEach((x) => {
      addresses.push({
        address: x.address,
        done: false,
      });
    });

    addresses.push({
      address: this.orderState.destination,
      done: false,
    });

    return addresses;
  }

  protected get options() {
    return skConfigModule.overpriceOptionsAfterOrderCreated.map((x) => ({
      id: `${x.id}`,
      value: x,
      $isDisabled:
        (!skModule.overprice && x.id === 0) ||
        (skModule.overprice && x.value <= skModule.overprice.value),
    }));
  }

  protected get value() {
    if (!skModule.overprice) {
      return;
    }
    let overprice = skModule.overprice;
    return this.options.find((x) => x.value.id === overprice.id) || null;
  }

  protected get showOrderAborted() {
    return this.orderState.state_kind === "aborted";
  }

  protected async forgetOrder() {
    try {
      await skModule.skForgetOrder();
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <div class="sk-order-status">
        <div class="sk-order-status__route-price">
          <SkOrderStatusRouteComponent
            class="sk-order-status__route"
            addresses={this.addresses}
          />
          <div class="sk-order-status__price-row">
            <div class="sk-price__bonuses">
              <SkPriceComponent
                class="sk-order-status__price"
                price={skModule.skPrice}
                minPrice={skConfigModule.minPrice}
              />

              {skFormModule.bonuses && skFormModule.isBonuses ? (
                <div class="sk-price__bonuses">
                  <div class="sk-price__bonuses-item">
                    <span>Бонусный баланс:</span>
                    <span class="sk-price__bonuses-nums">
                      {skFormModule.bonuses}
                    </span>
                  </div>
                  <div class="sk-price__bonuses-item sk-price__bonuses-item--amount">
                    <span>К оплате</span>
                    <span class="sk-price__bonuses-nums">
                      {Math.max(0, skFormModule.price - skFormModule.bonuses)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div class="sk-order-status__overprice">
              {this.canChangeOverprice ? (
                <SkMultiselect
                  class="sk-multiselect sk-multiselect_overprice sk-order-status__overprice-select"
                  value={this.value}
                  onInput={async (option: Option<Overprice> | null) => {
                    try {
                      await skModule.applyOverprice(
                        option ? option.value : null
                      );
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  placeholder=""
                  tabindex="1"
                  autofocus
                  searchable={false}
                  options={this.options}
                  track-by="id"
                  scopedSlots={{
                    placeholder: () => (
                      <SkIconUpdown class="sk-multiselect__cross" />
                    ),
                    noResult: () => `Ничего не найдено`,
                    noOptions: () => `Ничего не найдено`,
                    option: (props: { option: Option<Overprice> }) =>
                      props.option.value.name,
                    singleLabel: (props: { option: Option<Overprice> }) =>
                      props.option.value.name,
                  }}
                />
              ) : (
                []
              )}
            </div>
          </div>
        </div>
        <div class="sk-order-status__state-controls">
          <SkOrderStatusStateComponent
            class="sk-order-status__state"
            orderState={this.orderState}
            car={this.car}
          />
          <SkOrderStatusControlsComponent
            class="sk-order-status__controls"
            orderState={this.orderState}
            car={this.car}
          />
        </div>

        <SkDialogComponent
          show={this.showOrderAborted}
          onClose={() => this.forgetOrder()}
        >
          <div class="sk-dialog-warning">
            <SkIconWarning />
          </div>
          <div>К сожалению, Ваш заказ прекращён</div>

          <template slot="buttons">
            <button
              class="sk-dialog__button"
              onClick={() => this.forgetOrder()}
            >
              ОК
            </button>
          </template>
        </SkDialogComponent>
      </div>
    );
  }
}
