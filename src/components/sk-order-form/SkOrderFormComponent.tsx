import Component from "vue-class-component";
import * as tsx from "vue-tsx-support";
import { VNode } from "vue";
import { Multiselect } from "vue-multiselect";

import {
  TIncompleteDestination,
  alterDestinationId,
  CarType,
  Wish,
  Overprice,
  TCity,
} from "@model";
import { skFormModule, skConfigModule, SkFormModule } from "@store";
import { SkDestinationComponent } from "../sk-input-group/SkDestinationComponent";
import { SkPhoneComponent } from "../sk-input-group/SkPhoneComponent";
import { SkPriceComponent } from "../sk-price/SkPriceComponent";
import { SkIconSwap } from "../icons/SkIconSwap";
import { SkToggleComponent } from "../sk-input-group/SkToggleComponent";
import { SkIconMore } from "../icons/SkIconMore";
import { SkIconWarning } from "../icons/SkIconWarning";
import { SkTextareaComponent } from "../sk-input-group/SkTextareaComponent";
import { TmApiError } from "@api";
import { SkDialogComponent } from "../sk-dialog-service/SkDialogService";
import { SkIconQuestion } from "../icons/SkIconQuestion";
import { SkMultiselect } from "../sk-input-group/SkMultiselect";
import { SkDatePicker } from "../sk-input-group/SkDatePicker";
import { SkIconUpdown } from "../icons/SkIconUpdown";
import { SkOrderFormBonuses } from "./SkOrderFormBonuses";
import PincodeComponent from "vue-pincode-input";
import { Watch } from "vue-property-decorator";
import { SkSuccessComponent } from "../common/success";

export type SkOrderFormComponentProps = {};

@Component({})
export class SkOrderFormComponent extends tsx.Component<SkOrderFormComponentProps> {
  protected get destinations() {
    return skFormModule.destinations;
  }

  protected wishesExpanded: boolean = false;
  protected showDuplicate: boolean = false;
  protected showOrderCreationError: boolean = false;
  protected pincode: number | null = null;
  protected userPincode: string = "";
  protected isPincode: boolean = false;
  protected wasChecked: boolean = false;
  protected isCorrectPin: boolean = false;
  protected isBonuses: boolean = false;

  protected swap(i: number, j: number) {
    let destinations = skFormModule.destinations.slice();
    let t = destinations[i];
    destinations[i] = destinations[j];
    destinations[j] = t;
    skFormModule.setDestinations(destinations);
  }

  public getLetter(i: number): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let letter = alphabet[i % alphabet.length];

    while (i > alphabet.length) {
      i = Math.floor(i / alphabet.length);
      letter = alphabet[i % alphabet.length] + letter;
    }

    return letter;
  }

  protected async submit() {
    try {
      await skFormModule.createOrder();
      if (this.isBonuses) document.cookie = "bonuses=true";
    } catch (e) {
      if (e instanceof TmApiError && e.code === 100) {
        this.showDuplicate = true;
        return;
      }

      this.showOrderCreationError = true;
      console.error(e);
    }
  }

  private get randomPin() {
    return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  }

  private async sendPincode() {
    if (!this.pincode) {
      this.pincode = this.randomPin;
    }

    skFormModule.sendPincode(this.pincode);
  }

  private get isTelInCookie() {
    return document.cookie.includes(`phone=${skFormModule.phone}`);
  }

  private togglePin() {
    if (!this.isTelInCookie) {
      this.isPincode = true;
      if (this.isPincode || !this.isBonuses) this.sendPincode();
    } else {
      this.wasChecked = true;
      this.toggleBonuses(true);
    }
  }

  private async toggleBonuses(value: boolean) {
    if (!this.wasChecked) this.togglePin();
    else {
      const bonuses = await skFormModule.getClientBonuses();
      if (!skFormModule.isInDataBase) {
        this.isBonuses = false;
      } else {
        this.isBonuses = value;
        this.setPhoneCookie();
      }
    }
  }

  private setPhoneCookie() {
    document.cookie = `phone=${skFormModule.phone}`;
  }

  @Watch("userPincode")
  protected __onUserPincodeInput() {
    const MAX_PIN_LENGTH = 4;
    if (
      this.userPincode.length === MAX_PIN_LENGTH &&
      this.userPincode === String(this.pincode)
    ) {
      this.wasChecked = true;
      this.isCorrectPin = true;
      this.userPincode = "";
      this.pincode = this.randomPin;
    }
  }

  @Watch("isBonuses")
  protected __onBonusesChangeHandler() {
    skFormModule.setIsBonuses(this.isBonuses);
  }

  @Watch("isCorrectPin")
  protected __onUserCorrectPincodeInput() {
    setTimeout(() => {
      this.isPincode = false;
      this.toggleBonuses(true);
      this.isCorrectPin = false;
    }, 3000);
  }

  render() {
    return (
      <form
        class="sk-order-form"
        onSubmit={(e: Event) => {
          e.preventDefault();
          this.submit();
        }}
      >
        <div class="sk-order-form__destinations">
          {this.destinations.map((x, i) => {
            let q: VNode[] = [];

            if (i !== 0) {
              q.push(
                <SkIconSwap
                  key={`swap-${i}`}
                  class="sk-order-form__destination-swap"
                  nativeOnClick={(e: Event) => this.swap(i - 1, i)}
                />
              );
            }

            q.push(
              <div class="sk-order-form__destination" key={x.id}>
                <SkDestinationComponent
                  ref={"destinations" + x.id}
                  value={x}
                  city={skConfigModule.city}
                  includeCityOptions={i === 0}
                  districtCities={skConfigModule.districtCities}
                  letter={this.getLetter(i)}
                  onInput={(value: TIncompleteDestination) => {
                    let destinations = [...this.destinations];
                    destinations[i] = { ...value, id: destinations[i].id };
                    skFormModule.setDestinations(destinations);
                    if (!skFormModule.isAccurateAddresses)
                      this.isBonuses = false;
                  }}
                  onCity={(city: TCity) => {
                    if (i === 0) {
                      skConfigModule.setCityOptions({
                        city,
                        districtCities: skConfigModule.districtCities,
                      });
                    }
                  }}
                  onClear={() => {
                    if (this.destinations.length > 2) {
                      this.destinations.splice(i, 1);
                    } else {
                      let destinations = [...this.destinations];
                      destinations[i] = alterDestinationId({
                        address: null,
                        dropoff: "",
                      });
                      skFormModule.setDestinations(destinations);
                      (
                        this.$refs[
                          "destinations" + x.id
                        ] as SkDestinationComponent
                      ).focus();
                    }
                  }}
                />
              </div>
            );

            return q;
          })}
        </div>

        <div class="sk-order-form__somerow">
          <div class="sk-order-form__add-destination">
            <button
              type="button"
              class="sk-button sk-button_case_upper sk-order-form__add-destination-button"
              onClick={() => {
                skFormModule.addDestination();
              }}
            >
              Добавить остановку
            </button>
          </div>
          <div class="sk-order-form__phone">
            <SkPhoneComponent
              valid={skFormModule.isValidPhone}
              value={skFormModule.phone}
              label="Контактный телефон"
              onInput={(value: string) => {
                skFormModule.setPhone(value);
                if (!skFormModule.isTelValid) {
                  this.isBonuses = false;
                  this.wasChecked = false;
                  skFormModule.setIsInDataBase(true);
                  skFormModule.setIsBonuses(false);
                  skFormModule.setClientBonuses(null);
                }
              }}
            />
          </div>

          <div className="sk-order-form__price-container">
            <div class="sk-order-form__price-group">
              <SkPriceComponent
                class="sk-order-form__price"
                price={skFormModule.price}
                minPrice={skConfigModule.minPrice}
              />

              <div class="sk-order-form__overprice">
                <SkMultiselect
                  class="sk-multiselect sk-multiselect_overprice sk-order-form__overprice-select"
                  value={skFormModule.overprice}
                  onInput={(overprice: Overprice) => {
                    skFormModule.setOverprice(overprice);
                  }}
                  placeholder=""
                  searchable={false}
                  options={skConfigModule.overpriceOptions}
                  track-by="id"
                  label="name"
                  scopedSlots={{
                    placeholder: () => (
                      <SkIconUpdown class="sk-multiselect__cross" />
                    ),
                    noResult: () => `Ничего не найдено`,
                    noOptions: () => `Ничего не найдено`,
                  }}
                />
              </div>
              <div class="sk-order-form__help">
                <div class="sk-order-form__help-button" tabindex="0">
                  <SkIconQuestion />
                  <div class="sk-order-form__help-popover">
                    <div class="sk-order-form__help-header">Внимание</div>
                    <div class="sk-order-form__help-text">
                      Вы можете изменить стоимость заказа самостоятельно
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {skFormModule.bonuses &&
            this.isBonuses &&
            skFormModule.isBonuses ? (
              <div class="sk-price__bonuses">
                <div class="sk-price__bonuses-item">
                  <span>Бонусный баланс:</span>
                  <span class="sk-price__bonuses-nums">
                    {skFormModule.bonuses}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div class="sk-order-form__order-options">
          <div
            class={{
              "sk-order-form__wishes": true,
              "sk-order-form__wishes_expanded": this.wishesExpanded,
            }}
          >
            <div class="sk-order-form__wishes-button-row">
              <button
                class="sk-order-form__wishes-button"
                type="button"
                onClick={() => {
                  this.wishesExpanded = !this.wishesExpanded;
                }}
              >
                <div class="sk-order-form__wishes-button-text">Пожелания</div>
                <SkIconMore class="sk-order-form__wishes-button-icon" />
              </button>
            </div>
            <div class="sk-order-form__wishes-content">
              <div class="sk-order-form__wishes-row">
                <div class="sk-order-form__wishes-car">
                  <div class="sk-input-group">
                    <Multiselect
                      class="sk-multiselect sk-input-group__input"
                      value={skFormModule.car}
                      onInput={(car: CarType) => {
                        skFormModule.setCar(car);
                      }}
                      placeholder="Не выбран"
                      searchable={false}
                      options={skConfigModule.carOptions}
                      track-by="id"
                      label="name"
                      scopedSlots={{
                        noResult: () => `Ничего не найдено`,
                        noOptions: () => `Ничего не найдено`,
                      }}
                    />
                    <div class="sk-input-group__label">
                      <div class="sk-input-group__label-text">Автомобиль</div>
                    </div>
                  </div>
                </div>
                <div class="sk-order-form__wishes-options">
                  <div class="sk-input-group">
                    <Multiselect
                      class="sk-multiselect sk-multiselect_multiple sk-input-group__input"
                      value={skFormModule.wishes}
                      onInput={(wishes: Wish[]) => {
                        skFormModule.setWishes(wishes);
                      }}
                      placeholder="Не выбраны"
                      multiple={true}
                      searchable={false}
                      options={skConfigModule.wishOptions}
                      track-by="id"
                      label="name"
                      limit={1}
                      closeOnSelect={false}
                      limitText={(count: number) => `+ ${count}`}
                      scopedSlots={{
                        noResult: () => `Ничего не найдено`,
                        noOptions: () => `Ничего не найдено`,
                      }}
                    />
                    <div class="sk-input-group__label">
                      <div class="sk-input-group__label-text">Опции</div>
                      {skFormModule.wishes.length > 0 ? (
                        <span class="sk-input-group__badge">
                          выбрано {skFormModule.wishes.length}
                        </span>
                      ) : (
                        []
                      )}
                    </div>
                  </div>
                </div>
                <div class="sk-order-form__wishes-toggle-schedule">
                  <div class="sk-order-form__wishes-toggle-schedule-btn">
                    <SkToggleComponent
                      value={skFormModule.useSourceTime}
                      onInput={(use: boolean) =>
                        skFormModule.setUseSourceTime(use)
                      }
                    >
                      Заказ ко времени
                    </SkToggleComponent>
                  </div>
                </div>
              </div>
              {skFormModule.useSourceTime ? (
                <div class="sk-order-form__wishes-row">
                  <div class="sk-order-form__wishes-schedule">
                    <div class="sk-order-form__wishes-schedule-header">
                      Дата предварительной подачи
                    </div>
                    <SkDatePicker
                      value={skFormModule.sourceTime}
                      onInput={(value: string | null) =>
                        skFormModule.setSourceTime(value)
                      }
                      type="datetime"
                      format="YYYY-MM-DD - HH:mm"
                      valueType="YYYY-MM-DD - HH:mm"
                      minuteStep={5}
                      class="sk-date-picker sk-order-form__wishes-schedule-picker"
                    />
                  </div>
                  <div class="sk-panel sk-order-form__wishes-schedule-notice">
                    <div class="sk-order-form-schedule-notice">
                      <div class="sk-order-form-schedule-notice__header">
                        <SkIconWarning class="sk-order-form-schedule-notice__header-icon" />
                        <span class="sk-order-form-schedule-notice__header-text">
                          Внимание
                        </span>
                      </div>
                      <div class="sk-order-form-schedule-notice__content">
                        Предварительный заказ можно отследить или отменить на
                        сайте в любое время.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                []
              )}
            </div>
          </div>
          <SkOrderFormBonuses
            isBonuses={this.isBonuses}
            onChange={(value: boolean) => this.toggleBonuses(value)}
          />
        </div>
        <div class="sk-order-form__bottomline"></div>
        <div class="sk-order-form__comment-done">
          <div class="sk-order-form__comment">
            <div class="sk-input-group sk-order-form__comment-group">
              <SkTextareaComponent
                class="sk-input-group__input"
                value={skFormModule.comment}
                onInput={(value: string) => {
                  skFormModule.setComment(value);
                }}
              />
              <div class="sk-input-group__label">
                <div class="sk-input-group__label-text">Комментрий</div>
              </div>
            </div>
          </div>
          <div class="sk-order-form__done">
            <button
              class="sk-order-form__done-btn sk-button sk-button_case_upper"
              disabled={!skFormModule.canCreateOrder}
            >
              Поиск такси
            </button>
          </div>
        </div>

        <SkDialogComponent
          show={this.showDuplicate}
          onClose={() => (this.showDuplicate = false)}
        >
          <div class="sk-dialog-warning">
            <SkIconWarning />
          </div>
          <div>Заказ с такими параметрами уже создан</div>

          <template slot="buttons">
            <button
              class="sk-dialog__button"
              onClick={() => (this.showDuplicate = false)}
            >
              ОК
            </button>
          </template>
        </SkDialogComponent>

        <SkDialogComponent
          show={this.showOrderCreationError}
          onClose={() => (this.showOrderCreationError = false)}
        >
          <div class="sk-dialog-warning">
            <SkIconWarning />
          </div>
          <div>Не удалось создать заказ</div>

          <template slot="buttons">
            <button
              class="sk-dialog__button"
              onClick={() => (this.showOrderCreationError = false)}
            >
              ОК
            </button>
          </template>
        </SkDialogComponent>
        <SkDialogComponent
          show={this.isPincode && !this.wasChecked}
          onClose={() => (this.isPincode = false)}
        >
          {this.isCorrectPin ? (
            <SkSuccessComponent />
          ) : (
            <div>
              <span class="sk-order-form__pincode-text">
                На ваш телефон отправлен пинкод
              </span>
              <PincodeComponent vModel={this.userPincode} />
            </div>
          )}
          {!this.isCorrectPin ? (
            <template slot="buttons">
              <button
                class="sk-dialog__button"
                onClick={() => {
                  this.isPincode = false;
                  this.isBonuses = false;
                }}
              >
                Закрыть
              </button>
            </template>
          ) : (
            <template slot="buttons">
              <button hidden="true"></button>
            </template>
          )}
        </SkDialogComponent>
      </form>
    );
  }
}
