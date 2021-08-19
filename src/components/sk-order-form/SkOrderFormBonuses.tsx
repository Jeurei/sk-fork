import { skFormModule } from "@store";
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import * as tsx from "vue-tsx-support";

type SkOrderFormBonusesProps = {
  isBonuses: boolean;
  onChange: () => void;
};

@Component({})
export class SkOrderFormBonuses extends tsx.Component<SkOrderFormBonusesProps> {
  @Prop({ default: false })
  public isBonuses!: boolean;

  private get isValidFields() {
    return skFormModule.isTelValid && skFormModule.isAccurateAddresses;
  }

  render() {
    return (
      <div
        class={`sk-order-form__bonuses-container ${
          this.isValidFields && skFormModule.isInDataBase
            ? "sk-order-form__bonuses-container--active"
            : ""
        }`}
      >
        {!skFormModule.isInDataBase && this.isValidFields && (
          <span class="sk-order-form__bonuses-message">
            Чтобы поехать за бонусы у вас должна быть миниумум одна поездка!
          </span>
        )}
        <button
          onClick={() => this.$emit("change", !this.isBonuses)}
          type="button"
          class={`sk-toggle ${
            this.isValidFields && this.isBonuses ? "sk-toggle_value_on" : ""
          }`}
        >
          <div class="sk-toggle__text">Оплата бонусами</div>
          <div class="sk-toggle__pimp-area">
            <div class="sk-toggle__pimp"></div>
          </div>
        </button>
      </div>
    );
  }
}
