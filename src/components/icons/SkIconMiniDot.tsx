import Component from "vue-class-component";
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconMiniDot extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_minidot">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 3">
                    <circle fill="currentColor" cx="1.5" cy="1.5" r="1.5" />
                </svg>
            </span>
        );
    }
}
