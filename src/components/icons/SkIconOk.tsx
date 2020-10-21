import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconOk extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_ok">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                        fill="currentColor"
                        stroke="none"
                        d="M5.981632651388622,13 L0.08163265138864517,7.099999999999909 L1.4816326513886227,5.699999999999818 L5.981632651388622,10.099999999999909 L14.081632651388645,2 l1.4,1.4 z"
                    />
                </svg>
            </span>
        );
    }
}
