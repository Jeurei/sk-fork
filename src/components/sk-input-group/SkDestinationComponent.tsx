import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { VNode } from 'vue';

import { TIncompleteDestination, TAddress, TDestination, TCustomizableAddress, TCity } from '@model';

import { SkAutocompleteOptionsComponent, SkAutocompleteOption } from './SkAutocompleteOptionsComponent';
import { SkTextInputComponent } from './SkTextInputComponent';
import { SkInputGroupComponent } from './SkInputGroup';
import { SkAddress2Component } from './SkAddress2Component';
import { SkIconDot } from '../icons/SkIconDot';
import { SkIconMiniDot } from '../icons/SkIconMiniDot';


export type SkDestinationComponentProps = {
    value: TIncompleteDestination;
    label: string;
};

@Component({
    components: {
        SkAutocompleteOptionsComponent,
    },
})
export class SkDestinationComponent extends tsx.Component<SkDestinationComponentProps> {
    @Prop()
    protected readonly city!: TCity;
    @Prop()
    protected readonly includeCityOptions!: boolean;
    @Prop({ default: () => [] })
    protected readonly districtCities!: TCity[];
    @Prop()
    protected readonly value!: TIncompleteDestination;
    @Prop()
    protected readonly letter!: string;
    
    protected isFocusedAddress: boolean = false;
    protected isFocusedDropoff: boolean = false;

    protected address: TCustomizableAddress | null = null;
    protected dropoff: string = '';

    @Watch('value', { immediate: true })
    protected __onValueSpecified(newValue: TIncompleteDestination) {
        this.address = newValue.address;
        this.dropoff = newValue.dropoff;
    }

    protected onInputAddress(address: TCustomizableAddress | null) {
        this.address = address;

        // this.$refs.dropoffInput.focus(true);

        this.$emit('input', {
            address: this.address,
            dropoff: this.dropoff,
        } as TIncompleteDestination);
    }

    protected onFocusAddress() {
        this.isFocusedAddress = true;
        this.$emit('focus');
    }

    protected onBlurAddress() {
        this.isFocusedAddress = false;
        this.$emit('blur');
    }

    protected onInputDropoff(x: string) {
        this.dropoff = x;
        this.$emit('input', {
            address: this.address,
            dropoff: this.dropoff,
        } as TIncompleteDestination);
    }

    protected onFocusDropoff() {
        this.isFocusedDropoff = true;
        this.$emit('focus');
    }

    protected onBlurDropoff() {
        this.isFocusedDropoff = false;
        this.$emit('blur');
    }

    public clear() {
        this.address = null;
        this.dropoff = '';
        this.$emit('input', {
            address: this.address,
            dropoff: this.dropoff,
        } as TIncompleteDestination);
        this.$emit('clear');
    }

    public focus(dropoff: boolean = false) {
        if (!dropoff) {
            this.$refs.addressInput.focus();
        } else {
            this.$refs.dropoffInput.focus();
        }
    }

    public get classes() {
        return {
            'sk-destination': true,
            'sk-destination_focused': this.isFocusedAddress || this.isFocusedDropoff,
        };
    };

    public $refs!: {
        addressInput: SkAddress2Component,
        dropoffInput: SkTextInputComponent,
    };

    render(): VNode {
        return (
            <div class={this.classes}>
                <div class="sk-destination__letter">{this.letter}</div>
                <div class="sk-destination__point">
                    {
                        this.letter === 'A'
                        ? []
                        : [
                            <SkIconMiniDot class="sk-icon_flex sk-destination__point-minidot" />,
                            <SkIconMiniDot class="sk-icon_flex sk-destination__point-minidot" />,
                            <SkIconMiniDot class="sk-icon_flex sk-destination__point-minidot" />
                        ]
                    }
                    <SkIconDot class="sk-icon_flex sk-destination__point-dot" />
                </div>
                <div class="sk-destination__input-group">
                    <div class="sk-destination__address">
                        <div class="sk-input-group">
                            <SkAddress2Component
                                ref="addressInput"
                                city={this.city}
                                includeCityOptions={this.includeCityOptions}
                                districtCities={this.districtCities}
                                value={this.address}
                                class="sk-destination__address"
                                onInput={(address: TCustomizableAddress | null) => this.onInputAddress(address)}
                                onFocus={() => this.onFocusAddress()}
                                onBlur={() => this.onBlurAddress()}
                                onCity={(city: TCity) => this.$emit('city', city)}
                            />
                            <div class="sk-input-group__label">
                                <div class="sk-input-group__label-text">Адрес</div>
                            </div>
                        </div>
                    </div>
                    <div class="sk-destination__dropoff">
                        <label class="sk-input-group">
                            <SkTextInputComponent
                                ref="dropoffInput"
                                class="sk-input-group__input sk-text-input_square sk-text-input_bottom-spaced"
                                value={this.dropoff}
                                onInput={(q: string) => this.onInputDropoff(q)}
                                onFocus={() => this.onFocusDropoff()}
                                onBlur={() => this.onBlurDropoff()}
                            />
                            <div class="sk-input-group__label">
                                <div class="sk-input-group__label-text">Подъезд</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div
                    class="sk-destination__clear"
                    tabindex="0"
                    onKeydown={(e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { this.clear(); } }}
                    onClick={() => { this.clear(); }}
                ></div>
            </div>
        );
    }
}
