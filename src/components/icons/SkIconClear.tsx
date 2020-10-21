import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconClear extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_clear">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <g stroke="currentColor" stroke-width="3" stroke-linecap="round">
                        <line x1="3" y1="3" x2="13" y2="13" />
                        <line x1="13" y1="3" x2="3" y2="13" />
                    </g>
                </svg>
            </span>
        );
    }
}
