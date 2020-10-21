import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconWarning extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_warning">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20">
                    <path fill="currentColor" stroke="none" d="M8.616499776078285,2.1167379715076042 a4,4 0 0 1 6.767,0 l7.25,11.5 A4,4 0 0 1 19.2504997760783,19.749737971507642 H4.7504997760783 a4,4 0 0 1 -3.384,-6.133 z" />
                    <text style="font: bold 11px Arial-BoldMT, Arial;" fill="#fff" x="11.909" y="14.933"><tspan x="10.077" y="14.933">!</tspan></text>
                </svg>
            </span>
        );
    }
}
