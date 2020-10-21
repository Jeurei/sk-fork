import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconCross extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_cross">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <g fill="currentColor" stroke="none">
                        <rect x="0" y="7" width="16" height="2" />
                        <rect x="7" y="0" width="2" height="16" />
                    </g>
                </svg>
            </span>
        );
    }
}
