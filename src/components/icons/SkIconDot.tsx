import Component from "vue-class-component";
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconDot extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_dot">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9">
                    <circle fill="currentColor" cx="4.5" cy="4.5" r="4.5" />
                </svg>
            </span>
        );
    }
}
