import Component from "vue-class-component";
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkIconQuestion extends tsx.Component<{}> {
    render() {
        return (
            <span class="sk-icon sk-icon_type_question">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M16,0 a16,16 0 1 0 16,16 A16,16 0 0 0 16,0 zm0.047,26.876 a2.69,2.69 0 1 1 0,-5.375 a2.62,2.62 0 0 1 2.8,2.67 a2.581,2.581 0 0 1 -2.8,2.705 zm3.566,-12.818 l-0.2,0.21 c-0.789,0.829 -1.684,1.768 -1.684,2.351 a2.772,2.772 0 0 0 0.358,1.348 l0.146,0.278 l-0.113,0.429 a0.617,0.617 0 0 1 -0.567,0.377 h-2.682 a0.868,0.868 0 0 1 -0.65,-0.235 a4.113,4.113 0 0 1 -0.845,-2.524 c0,-1.678 0.934,-2.714 2.225,-4.15 c0.2,-0.219 0.391,-0.42 0.575,-0.61 c0.629,-0.65 1.014,-1.07 1.014,-1.515 c0,-0.307 0,-1.244 -1.786,-1.244 a5.916,5.916 0 0 0 -3.159,0.919 a0.6,0.6 0 0 1 -0.653,-0.02 l-0.236,-0.169 l-0.056,-0.443 v-2.9 a0.879,0.879 0 0 1 0.394,-0.82 a8.271,8.271 0 0 1 4.3,-1.1 c3.291,0 5.5,2.118 5.5,5.272 a6.134,6.134 0 0 1 -1.881,4.546 z" fill="currentColor" />
                </svg>
            </span>
        );
    }
}