import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconMore extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_more">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <circle fill="currentColor" cx="8" cy="8" r="8" />
                    <path fill="#fff" d="M10.7,22.5 L6,17.8 L7.4,16.4 L10.7,19.7 L14,16.4 l1.4,1.4 z" transform="rotate(-90 4,14.4)" />
                </svg>
            </span>
        );
    }
}
