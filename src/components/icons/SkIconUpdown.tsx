import Component from "vue-class-component";
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconUpdown extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_updown">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(90, 12, 12)">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </g>
                </svg>
            </span>
        );
    }
}
