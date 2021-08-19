import { VNode } from "vue";
import { Prop, Component } from "vue-property-decorator";
import * as tsx from "vue-tsx-support";

export type SkAutocompleteOption<T> = {
  title: string;
  description: string;
  value: T;
};

export type SkAutocompleteOptionsComponentProps<T> = {
  options: SkAutocompleteOption<T>[];
};

export type SkAutocompleteOptionsComponentEventsWithOn<T> = {
  onInput: (value: T) => void;
};

@Component({})
export class SkAutocompleteOptionsComponent<T>
  extends tsx.Component<
    SkAutocompleteOptionsComponentProps<T>,
    SkAutocompleteOptionsComponentEventsWithOn<T>
  >
  implements SkAutocompleteOptionsComponentProps<T>
{
  @Prop()
  public options!: SkAutocompleteOption<T>[];

  public render(): VNode {
    return (
      <div class="sk-autocomplete-options">
        {this.options.map((option) => (
          <div
            class="sk-autocomplete-options__option"
            onClick={() => this.$emit("input", option.value)}
            onMousedown={(e: Event) => e.preventDefault()}
          >
            <div class="sk-autocomplete-options__option-title">
              {option.title}
            </div>
            <div class="sk-autocomplete-options__option-description">
              {option.description}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
