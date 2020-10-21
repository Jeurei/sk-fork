import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconLoading extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_loading">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="geometricPrecision">
                    {/* <path fill="#7e7e7e" d="M8,16 a8,8 0 1 1 8,-8 A8.012,8.012 0 0 1 8,16 zM8,1.778 A6.222,6.222 0 1 0 14.222,8 A6.229,6.229 0 0 0 8,1.778 z" /> */}
                    {/* <circle fill="none" stroke="#7e7e7e" stroke-width="1.2" cx="8" cy="8" r="7.2" />
                    <path fill="currentColor" d="M8,16 A8.012,8.012 0 0 1 0,8 a0.88,0.88 0 0 1 0.889,-0.889 A0.88,0.88 0 0 1 1.778,8 A6.222,6.222 0 1 0 8,1.778 A0.88,0.88 0 0 1 7.111,0.889 A0.88,0.88 0 0 1 8,0 A8,8 0 0 1 8,16 z" /> */}
                    <circle fill="none" stroke="#c9c9c9" stroke-width="1" cx="8" cy="8" r="7" />
                    <path
                        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        d="M8,1 A7,7 270 1 1 1,8"
                    />

                    
                </svg>
            </span>
        );
    }
}
