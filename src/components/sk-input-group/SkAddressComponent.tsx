import Vue from 'vue';
import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop, Watch } from 'vue-property-decorator';
import { Multiselect } from 'vue-multiselect';

import { TAddress, getAddressId, TCity } from '@model';
import { SkAddressCompleteService } from './SkAddressCompleteService';

function debounce<T, A extends Array<any>>(this: T, fn: (...args: A) => void, debounceTime: number) {
    let timeout: number | null = null;
  
    let debounced = function(this: T, ...args: A) {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            fn.apply(this, args);
        }, debounceTime);
    };
  
    return debounced;
  }

export type SkAddressComponentProps = {
    value: TAddress | null;
    label?: string;
};

export type Option<T> = {
    id: string;
    value: T;
    $isDisabled: boolean;
}

@Component({})
export class SkAddressComponent extends tsx.Component<SkAddressComponentProps> {
    @Prop()
    public city!: TCity;

    @Prop()
    public value!: TAddress | null;

    @Prop({ default: 'Адрес' })
    public label!: string;

    protected query: string = '';
    protected selectedOption: Option<TAddress> | null = null;
    protected options: Option<TAddress>[] = [];
    // protected actualAddress: TAddress | null = null;
    protected loadingOptions: boolean = false;

    protected isFocused: boolean = false;

    protected completeService = new SkAddressCompleteService();

    public setQuery(query: string) {
        this.query = query;
        this.debouncedUpdateOptions(query);
    }

    protected onInput(query: string) {
        this.setQuery(query);
    }

    protected onSelect(option: Option<TAddress> | null) {
        if (option && (option.value.coords.lat === 0 && option.value.coords.lon === 0)) {
            this.setSemiOption(option.value);
            return;
        }

        this.setAddress(option);
        this.$emit('input', option ? option.value : null);
    }

    protected setSemiOption(address: TAddress) {
        let query = address.street || address.point || '';

        Vue.nextTick(() => {
            this.setQuery(query);
            this.focus();

            let ms = this.$refs.ms as any;
            if (ms) {
                ms.updateSearch(query);
            }
        });
    }

    protected setAddress(option: Option<TAddress> | null) {
        if (option) {
            let address = option.value;
            let query = '';
            switch (address.kind) {
                case 'point':
                    query = address.point;
                    break;
                case 'street':
                    query = address.street;
                    break;
                case 'house':
                    query = address.house ? `${address.street}, ${address.house}` : address.street;
                    break;
            }
            this.query = query;
            this.selectedOption = option;
            this.debouncedUpdateOptions(query);
        } else {
            this.query = '';
            this.selectedOption = null;
            this.debouncedUpdateOptions('');
        }
    }

    protected clear() {
        this.query = '';
        this.selectedOption = null;
        this.debouncedUpdateOptions('');
    }

    @Watch('value', { immediate: true })
    protected __onValueSpecified(value: TAddress | null) {
        if (value) {
            if (!this.selectedOption || getAddressId(value) !== getAddressId(this.selectedOption.value)) {
                this.setAddress({ value, $isDisabled: true, id: getAddressId(value) });
            }
        } else {
            if (this.selectedOption) {
                this.clear();
            }
        }
    }

    // @Watch('query', { immediate: true })
    protected async updateOptions(query: string) {
        // let query = this.query;
        try {
            this.loadingOptions = true;
            let options = await this.completeService.find(this.city, query);
            if (query !== this.query) {
                return;
            }

            this.options = options.map(x => ({
                value: x,
                id: getAddressId(x),
                $isDisabled: !!this.selectedOption && getAddressId(x) === getAddressId(this.selectedOption.value)
            }));
            this.loadingOptions = false;
        } catch (e) {
            if (query === this.query) {
                this.options = [];
                this.loadingOptions = false;
            }
        }
    }

    protected debouncedUpdateOptions: (query: string) => void = debounce((query: string) => {
        this.updateOptions(query);
    }, 300);

    protected onFocus() {
        this.isFocused = true;
        this.$emit('focus');
    }

    protected onBlur() {
        this.isFocused = false;
        this.$emit('blur');
    }

    public $refs!: {
        input: HTMLInputElement,
        ms: Multiselect,
    };

    public focus() {
        let ms = this.$refs.ms as any;
        if (ms) {
            ms.activate();
        }
    }

    protected get classes() {
        return {
            'sk-address': true,
            'sk-address_focused': this.isFocused,
        };
    }

    // @Watch('query')
    // public onSearchQueryChanged(query: string) {
    //     let q = this.$refs.ms as any;
    //     if (query !== q.search) {
    //         q.updateSearch(query);
    //     }
    // }

    render() {
        return (
            <div class={this.classes}>
                <div class="sk-input-group">

                    <Multiselect
                        ref="ms"
                        class="sk-multiselect sk-multiselect_square sk-input-group__input"
                        options={this.options}
                        value={this.value}
                        onInput={(value: Option<TAddress>) => this.onSelect(value)}
                        placeholder="Выберите адрес"
                        searchable={true}
                        track-by="id"
                        customLabel={(address: TAddress) => {
                            let label = '';
                            switch (address.kind) {
                                case 'point':
                                    label = address.point;
                                    break;
                                case 'street':
                                    label = address.street;
                                    break;
                                case 'house':
                                    label = address.house ? `${address.street}, ${address.house}` : address.street;
                                    break;
                            }
                            return label;
                        }}
                        loading={this.loadingOptions}
                        internalSearch={false}
                        preserveSearch={true}
                        hideSelected={false}
                        closeOnSelect={true}
                        onSearch-change={(query: string) => this.onInput(query)}
                        scopedSlots={{
                            option: (props: { option: Option<TAddress> }) => (
                                props.option.value.kind === 'point'
                                ? <div>
                                    <div>{props.option.value.point}</div>
                                    <div>{props.option.value.street}{props.option.value.house ? `, ${props.option.value.house}` : ''}</div>
                                </div>
                                : props.option.value.kind === 'street'
                                ? <div>
                                    <div>{props.option.value.street}</div>
                                    <div>{props.option.value.comment}</div>
                                </div>
                                : <div>
                                    <div>{props.option.value.street}{props.option.value.house ? `, ${props.option.value.house}` : ''}</div>
                                    <div>{props.option.value.comment}</div>
                                </div>
                            ),
                            noResult: () => `Ничего не найдено`,
                            noOptions: () => `Ничего не найдено`,
                        }}
                    />
                    <div class="sk-input-group__label">
                        <div class="sk-input-group__label-text">{this.label}</div>
                    </div>
                </div>
            </div>
        );
    }
}
