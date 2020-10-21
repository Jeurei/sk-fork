import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import Datepicker from 'vue2-datepicker';
import { IMaskComponent } from 'vue-imask';
import { Prop } from 'vue-property-decorator';

const enum SkDatePickerModes {
    Unknown,
    Date,
    Hour,
    Minute
}

export type SkDatePickerProps = {
    value: string | null;
};

function getDate(s: string | null, now: Date = new Date()) {
    let m = /^(\d{1,4})(?:-(\d{1,2})(?:-(\d{1,2})(?: - (\d{1,2})(?::(\d{1,2}))?)?)?)?/.exec(s || '');
    let year = m && m[1] ? parseInt(m[1], 10) : now.getFullYear();
    let month = m && m[2] ? parseInt(m[2], 10) : now.getMonth();
    let day = m && m[3] ? parseInt(m[3], 10) : now.getDate();
    let hour = m && m[4] ? parseInt(m[4], 10) : now.getHours();
    let minute = m && m[5] ? parseInt(m[5], 10) : now.getMinutes();
    minute = Math.round(minute / 5) * 5;
    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function pad(s: string | number, count: number = 2) {
    let pad = '0'.repeat(count - `${s}`.length);
    return pad + s;
}

function getString(date: Date) {
    return '' +
        `${pad(date.getFullYear(), 4)}` +
        `-${pad(date.getMonth() + 1)}` +
        `-${pad(date.getDate())}` +
        ` - ${pad(date.getHours())}` +
        `:${pad(date.getMinutes())}` +
        '';
}

@Component({
    inheritAttrs: false,
    components: {
        'date-picker': Datepicker,
        'imask-input': IMaskComponent,
    }
})
export class SkDatePicker extends tsx.Component<SkDatePickerProps> {
    @Prop()
    public value!: string | null;

    private eventAttached: boolean = false;
    private timeMode: SkDatePickerModes = SkDatePickerModes.Hour;

    protected get popupClass() {
        return {
            'hour-mode': this.timeMode === SkDatePickerModes.Hour,
            'minute-mode': this.timeMode === SkDatePickerModes.Minute,
        };
    }

    private handlerKey = (e: KeyboardEvent) => {
        this.handleKey(e);
    }

    private handler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.commit();
        }
    }

    private handlerTab = (e: KeyboardEvent) => {
        if (!e.defaultPrevented && e.key === 'Tab') {
            let picker = this.getPicker();
            picker && picker.closePopup();
        }
    }

    protected opened(e: any) {
        this.attachEvent();
        this.$emit('open', e);
    }

    protected closed() {
        this.detachEvent();
        this.timeMode = SkDatePickerModes.Hour;
        this.goToDatePanel();
        this.$emit('close');
    }

    protected attachEvent() {
        if (this.eventAttached) {
            return;
        }

        this.eventAttached = true;
        document.addEventListener('keydown', this.handler);
        document.addEventListener('keydown', this.handlerKey);
        document.addEventListener('keydown', this.handlerTab);
    }

    protected detachEvent() {
        this.eventAttached = false;
        document.removeEventListener('keydown', this.handler);
        document.removeEventListener('keydown', this.handlerKey);
        document.removeEventListener('keydown', this.handlerTab);
    }

    public beforeDestroy() {
        this.detachEvent();
    }

    protected commit() {
        let picker = this.$refs['date-picker'] as any;
        if (!picker) {
            return;
        }

        picker.closePopup();
    }

    protected getPicker() {
        return this.$refs['date-picker'] as any || null;
    }

    protected getInnerPicker() {
        let picker = this.getPicker();
        if (!picker) {
            return null;
        }
        if (picker.type !== 'datetime') {
            return null;
        }

        let innerPicker = picker.$refs.picker;
        if (!innerPicker) {
            return null;
        }

        return innerPicker;
    }

    protected getMode(): SkDatePickerModes {
        let innerPicker = this.getInnerPicker();
        if (!innerPicker) {
            return SkDatePickerModes.Unknown;
        }

        let timeVisible = innerPicker.timeVisible;

        if (timeVisible === false) { // see else case
            return SkDatePickerModes.Date;
        } else if (timeVisible === true) { // see else case
            return this.timeMode;
        } else {
            // another picker (not datetime)
            return SkDatePickerModes.Unknown;
        }
    }

    protected goToTimePanel() {
        let innerPicker = this.getInnerPicker();
        if (!innerPicker) {
            return;
        }

        innerPicker.openTimePanel();
    }

    protected goToDatePanel() {
        let innerPicker = this.getInnerPicker();
        if (!innerPicker) {
            return;
        }

        innerPicker.closeTimePanel();
    }

    protected handleKey(e: KeyboardEvent) {
        let mode = this.getMode();

        if (mode === SkDatePickerModes.Date) {
            switch (e.key) {
                case 'ArrowUp':
                    this.handleDateUp(e);
                    break;
                case 'ArrowDown':
                    this.handleDateDown(e);
                    break;
                case 'ArrowLeft':
                    this.handleDateLeft(e);
                    break;
                case 'ArrowRight':
                    this.handleDateRight(e);
                    break;
                case 'Tab':
                    if (!e.shiftKey) {
                        e.preventDefault();
                        this.goToTimePanel();
                    }
            }
        } else if (mode === SkDatePickerModes.Hour) {
            switch (e.key) {
                case 'ArrowUp':
                    this.handleHourUp(e);
                    break;
                case 'ArrowDown':
                    this.handleHourDown(e);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.timeMode = SkDatePickerModes.Minute;
                    break;
                case 'Tab':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.goToDatePanel();
                    }
            }
        } else if (mode === SkDatePickerModes.Minute) {
            switch (e.key) {
                case 'ArrowUp':
                    this.handleMinuteUp(e);
                    break;
                case 'ArrowDown':
                    this.handleMinuteDown(e);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.timeMode = SkDatePickerModes.Hour;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    break;
                case 'Tab':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.goToDatePanel();
                    }
            }
        }
    }

    protected handleDateLeft(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        let dow = date.getDay();
        if (dow === 1) { // monday
            return;
        }
        date.setDate(date.getDate() - 1);
        this.$emit('input', getString(date));
    }

    protected handleDateRight(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        let dow = date.getDay();
        if (dow === 0) { // sunday
            return;
        }
        date.setDate(date.getDate() + 1);
        this.$emit('input', getString(date));
    }

    protected handleDateUp(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        date.setDate(date.getDate() - 7);
        this.$emit('input', getString(date));
    }

    protected handleDateDown(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        date.setDate(date.getDate() + 7);
        this.$emit('input', getString(date));
    }

    protected handleHourUp(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        if (date.getHours() <= 0) {
            return;
        }
        date.setHours(date.getHours() - 1);
        this.$emit('input', getString(date));
    }

    protected handleHourDown(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        if (date.getHours() >= 23) {
            return;
        }
        date.setHours(date.getHours() + 1);
        this.$emit('input', getString(date));
    }

    protected handleMinuteUp(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        if (date.getMinutes() <= 0) {
            return;
        }
        date.setMinutes(date.getMinutes() - 5);
        this.$emit('input', getString(date));
    }

    protected handleMinuteDown(e: KeyboardEvent) {
        e.preventDefault();
        let date = getDate(this.value);
        if (date.getMinutes() >= 55) {
            return;
        }
        date.setMinutes(date.getMinutes() + 5);
        this.$emit('input', getString(date));
    }

    protected onFocus() {
        let picker = this.getPicker();
        if (picker) {
            picker.handleInputFocus();
        }
        this.$emit('focus');
    }

    protected onBlur() {
        let picker = this.getPicker();
        if (picker) {
            picker.handleInputBlur();
        }
        this.$emit('blur');
    }

    protected onInput(s: string | null) {
        let picker = this.getPicker();
        if (picker) {
            picker.handleInputInput({ target: { value: s || '' } });
        }
    }

    protected handleClear() {
        let picker = this.getPicker();
        if (picker) {
            picker.handleClear();
        }
    }

    render() {
        return (
            <date-picker
                ref="date-picker"
                {...{
                    props: {
                        ...this.$attrs,
                        value: this.value,
                        popupClass: this.popupClass,
                    }
                }}
                on={{
                    ...this.$listeners,
                    open: (e: any) => this.opened(e),
                    close: () => this.closed(),
                }}
                scopedSlots={{
                    input: () => (
                        <imask-input
                            value={this.value}
                            onInput={(value: string | null) => this.onInput(value)}
                            class="sk-text-input sk-text-input_nolabel"
                            name="date"
                            mask="0000-00-00 - 00:00"
                            placeholder="ГГГГ-ММ-ДД ЧЧ-ММ"
                            autocomplete="off"
                            onFocus={() => this.onFocus()}
                            onBlur={() => this.onBlur()}
                        />
                    ),
                    'icon-calendar': () => (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path
                                fill="currentColor"
                                d="M2.0017027854919434,5.001702785491943 v9 H14.001702785491943 V5.001702785491943 zM13.001702785491943,2.0017027854919434 h2 a0.9450000000000005,0.9450000000000005 0 0 1 1,1 V15.001702785491943 a0.9450000000000005,0.9450000000000005 0 0 1 -1,1 H1.0017027854919434 a0.9450000000000005,0.9450000000000005 0 0 1 -1,-1 V3.0017027854919434 A0.9450000000000005,0.9450000000000005 0 0 1 1.0017027854919434,2.0017027854919434 H3.0017027854919434 V1.0017027854919434 A0.9450000000000005,0.9450000000000005 0 0 1 4.001702785491943,0.0017027854919433594 A0.9450000000000005,0.9450000000000005 0 0 1 5.001702785491943,1.0017027854919434 V2.0017027854919434 h6 V1.0017027854919434 a1,1 0 0 1 2,0 zM12.001702785491943,12.001702785491943 H10.001702785491943 V10.001702785491943 h2 zM9.001702785491943,12.001702785491943 H7.001702785491943 V10.001702785491943 H9.001702785491943 zm3,-3 H10.001702785491943 V7.001702785491943 h2 zM9.001702785491943,9.001702785491943 H7.001702785491943 V7.001702785491943 H9.001702785491943 zM6.001702785491943,12.001702785491943 H4.001702785491943 V10.001702785491943 H6.001702785491943 z"
                            />
                        </svg>
                    ),
                    'icon-clear': () => (
                        <button class="sk-date-picker__clear-btn" type="button" onClick={(e: any) => this.handleClear()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <rect width="20" height="2" transform="rotate(45 1.414215087890625,0) " y="0" x="1.4142136573791504" />
                                <rect width="20" height="2" transform="rotate(-45 0,14.142135620117186) " y="14.142135620117188" x="0" />
                            </svg>
                        </button>
                    ),
                    ...this.$scopedSlots,
                }}
            />
        );
    }
}
