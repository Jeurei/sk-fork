import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop, Watch, Inject, Provide } from 'vue-property-decorator';
import { getAddressId, TCustomizableAddress, TCity } from '@model';
import { SkAddressCompleteService } from './SkAddressCompleteService';

function getQueryByAddress(address: TCustomizableAddress | null) {
    if (!address) {
        return '';
    }

    if (address.isCustom) {
        return address.point;
    }

    switch (address.kind) {
        case 'point':
            return address.point;
        case 'street':
            return address.street;
        case 'house':
            return address.house ? `${address.street}, ${address.house}` : address.street;
        default:
            return '';
    }
}

function getDescriptionByAddress(address: TCustomizableAddress | null) {
    if (!address) {
        return '';
    }

    if (address.isCustom) {
        return '';
    }

    switch (address.kind) {
        case 'point':
            return `${address.city} ${address.street}, ${address.house}` ;
        case 'street':
            return address.city;
        case 'house':
            return address.city ;
        default:
            return '';
    }
}

function isCityDestination(address: TCustomizableAddress | null) {
    return address && address.address_source === 'custom' && address.citymeta;
}

function isDefinedDestination(address: TCustomizableAddress | null) {
    return address && !address.isCustom && (address.coords.lat !== 0 || address.coords.lon !== 0);
}

type SkAddress2OptionsComponentProps<T> = {
    options: T[];
    selected: T;
    opened: boolean;
};

type SkAddress2OptionsComponentEvents<T> = {
    onSelect: T;
};

type SkAddress2OptionsComponentSlotProps<T> = {
    key: string;
    value: T;
    classes: {
        [className: string]: boolean;
    };
    index: number;
    setCursor: () => void;
    onSelect: () => void;
};

@Component({})
export class SkAddress2OptionsComponent<T> extends tsx.Component<SkAddress2OptionsComponentProps<T>, SkAddress2OptionsComponentEvents<T>, { option: SkAddress2OptionsComponentSlotProps<T> }> {
    @Prop()
    public readonly options!: T[];

    @Prop()
    public readonly selected!: T;

    @Prop()
    public readonly opened!: boolean;

    @Inject()
    protected readonly comparator!: (a: T, b: T) => boolean;

    @Inject({ default: null })
    protected readonly keygen!: ((x: T) => string) | null;

    protected cursor: number = -1;
    protected below: boolean = true;

    public next() {
        this.setCursor(this.cursor + 1);
    }

    public prev() {
        this.setCursor(Math.max(this.cursor - 1, 0));
    }

    public getHighlighted(): T | null {
        if (this.cursor === -1) {
            return null;
        }

        return this.options[this.cursor] || null;
    }

    public selectCurrent() {
        if (0 <= this.cursor && this.cursor < this.options.length) {
            this.$emit('select', this.options[this.cursor]);
        }
    }

    public setCursor(cursor: number) {
        if (cursor >= this.options.length) {
            cursor = this.options.length - 1;
        }

        if (cursor < 0) {
            cursor = -1;
        }

        this.cursor = cursor;
    }

    protected get classes() {
        return {
            'sk-address2-options': true,
            'sk-address2-options_empty': this.options.length === 0,
            'sk-address2-options_notempty': this.options.length > 0,
            'sk-address2-options_opened': this.opened,
            'sk-address2-options_closed': !this.opened,
            'sk-address2-options_position_below': this.below,
            'sk-address2-options_position_above': !this.below,
        };
    }

    public scrollToCursor() {
        let index = this.cursor;

        this.$nextTick(() => {
            this.scrollToIndex(index);
        });
    }

    public scrollToIndex(index: number) {
        if (index < 0) {
            return;
        }

        if (!this.$el) {
            return;
        }

        let target = this.$el.children[index];
        if (!target) {
            return;
        }

        let elRect = this.$el.getBoundingClientRect();
        let targetRect = target.getBoundingClientRect();

        if (elRect.top > targetRect.top) {
            // scroll up
            let delta = elRect.top - targetRect.top;
            this.$el.scrollTop = this.$el.scrollTop - delta;
        } else if (elRect.bottom < targetRect.bottom) {
            let delta = targetRect.bottom - elRect.bottom;
            this.$el.scrollTop = this.$el.scrollTop + delta;
        }
    }

    public render() {
        let options = this.options.map((x, i) => {
            let classes = {
                'sk-address2-options__option': true,
                'sk-address2-options__option_highlight': this.cursor === i,
                'sk-address2-options__option_selected': this.comparator(this.selected, x),
            };
            let key = this.keygen ? this.keygen(x) : `${i}`;
            return this.$scopedSlots.option ? (
                this.$scopedSlots.option({
                    value: x,
                    classes,
                    index: i,
                    key,
                    setCursor: () => this.setCursor(i),
                    onSelect: () => this.$emit('select', x),
                })
            ) : (
                <div key={key} class={classes} onMouseenter={() => this.setCursor(i)} onMousedown={tsx.modifiers.prevent(() => this.$emit('select', x))}>
                    {x}
                </div>
            );
        });

        return <div class={this.classes}>{options}</div>;
    }
}

@Component({})
export class SkAddress2Component extends tsx.Component<{}> {
    @Prop()
    public readonly value!: TCustomizableAddress | null;

    @Prop()
    public readonly city!: TCity;
    @Prop()
    public readonly includeCityOptions!: boolean;
    @Prop({ default: () => [] })
    public readonly districtCities!: TCity[];

    @Watch('value')
    protected __onValueSpecified(value: TCustomizableAddress | null, oldValue: TCustomizableAddress | null) {
        if (!this.comparator(value, oldValue)) {
            this.setQuery(getQueryByAddress(value), false, false);
        }
    }

    @Provide()
    protected comparator(a: TCustomizableAddress | null, b: TCustomizableAddress | null) {
        if (a && a.isCustom && b && b.isCustom) {
            return a.point.replace(/(^\s+|\s+$)/g, '') === b.point.replace(/(^\s+|\s+$)/g, '');
        }

        return getAddressId(a) === getAddressId(b);
    }

    @Provide()
    protected keygen(x: TCustomizableAddress | null) {
        return getAddressId(x);
    }

    protected completeService = new SkAddressCompleteService();

    protected query: string = '';

    protected options: TCustomizableAddress[] = [];
    protected loadingOptions: boolean = false;
    protected opened: boolean = false;
    protected focused: boolean = false;

    protected get classes() {
        return {
            'sk-address2': true,
            'sk-address2_focused': this.focused,
            'sk-address2_notfocused': !this.focused,
        };
    }

    public $refs!: {
        input: HTMLInputElement,
        options: SkAddress2OptionsComponent<TCustomizableAddress>
    };

    public select(x: TCustomizableAddress | null) {
        if (x) {
            if (isCityDestination(x)) {
                this.$emit('city', x.citymeta);
                this.setQuery('');
                return;
            } else if (!isDefinedDestination(x)) {
                this.setQuery(getQueryByAddress(x) + ', ', true, false);
                return;
            }
        }

        this.blur();
        this.$emit('input', x);
    }

    protected setQuery(query: string, updateOptions: boolean = true, asCustom: boolean = false) {
        this.query = query;
        if (updateOptions) {
            this.updateOptions(query);
        }

        if (asCustom) {
            let option: TCustomizableAddress | null = null;
            let trimmed = query.replace(/(^\s+|\s+$)/g, '');
            if (trimmed) {
                option = {
                    address_source: 'custom',
                    isCustom: true,
                    city: '',
                    citymeta: null,
                    comment: '',
                    coords: { lat: 0, lon: 0 },
                    house: '',
                    street: '',
                    kind: 'house',
                    point: trimmed,
                };
            }

            this.$emit('input', option);
        }
    }

    protected async updateOptions(query: string) {
        let trimmed = query.trim();
        if (trimmed.length < 3) {
            this.options = [];
            this.loadingOptions = false;
            return;
        }

        try {
            this.loadingOptions = true;
            let options = await this.completeService.findInDistrict(this.city, this.districtCities, trimmed, this.includeCityOptions);
            if (query !== this.query) {
                return;
            }

            this.options = options;
            this.loadingOptions = false;
        } catch (e) {
            if (query === this.query) {
                this.options = [];
                this.loadingOptions = false;
            }
        }
    }

    protected handleKey(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (this.$refs.options) {
                    this.$refs.options.prev();
                    this.$refs.options.scrollToCursor();
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                if (this.$refs.options) {
                    this.$refs.options.next();
                    this.$refs.options.scrollToCursor();
                }
                break;

            case 'Enter':
                e.preventDefault();
                this.$refs.options && this.$refs.options.selectCurrent();
                break;

            case 'Tab':
                if (this.$refs.options) {
                    let option = this.$refs.options.getHighlighted();
                    if (option && !isDefinedDestination(option)) {
                        e.preventDefault();
                    }
                    this.$refs.options.selectCurrent();
                }
                break;
        }
    }

    public focus() {
        if (this.$refs.input) {
            this.$refs.input.focus();
            // this.onFocus();
        }
    }

    public blur() {
        if (this.$refs.input) {
            this.$refs.input.blur();
            // this.onBlur();
        }
    }

    protected onFocus() {
        this.focused = true;
        this.opened = true;
        this.$emit('focus');
    }

    protected onBlur() {
        this.focused = false;
        this.opened = false;
        this.$emit('blur');
    }

    render() {
        return (
            <div class={this.classes}>
                <input
                    ref="input"
                    class="sk-address2__input"
                    placeholder="Выберите адрес"
                    value={this.query}
                    onInput={(e: Event) => this.setQuery((e.target as HTMLInputElement).value, true, true)}
                    onKeydown={(e: KeyboardEvent) => this.handleKey(e)}
                    onFocus={() => this.onFocus()}
                    onBlur={() => this.onBlur()}
                />

                {
                    this.value && this.value.city
                    ? <span class="sk-address2__city">{this.value.city}</span>
                    : []
                }

                <SkAddress2OptionsComponent
                    ref="options"
                    selected={this.value}
                    options={this.options}
                    opened={this.opened}
                    onSelect={(x: TCustomizableAddress) => this.select(x)}
                    scopedSlots={{
                        option: (option: SkAddress2OptionsComponentSlotProps<TCustomizableAddress>) => (
                            <div
                                key={option.key}
                                class={{
                                    ...option.classes,
                                    'sk-address2__option': true,
                                    'sk-address2__option_final': isDefinedDestination(option.value),
                                    'sk-address2__option_notfinal': !isDefinedDestination(option.value)
                                }}
                                onMouseenter={() => option.setCursor()}
                                onMousedown={tsx.modifiers.prevent(() => option.onSelect())}
                            >
                                {
                                    option.value.citymeta && option.value.address_source === 'custom'
                                    ? [
                                        <div class="sk-address2__option-street">{option.value.citymeta.name}</div>,
                                        <div class="sk-address2__option-city"></div>
                                    ]
                                    : [
                                        <div class="sk-address2__option-street">{getQueryByAddress(option.value)}</div>,
                                        <div class="sk-address2__option-city">{getDescriptionByAddress(option.value)}</div>
                                    ]
                                }
                            </div>
                        ),
                    }}
                />
            </div>
        );
    }
}
