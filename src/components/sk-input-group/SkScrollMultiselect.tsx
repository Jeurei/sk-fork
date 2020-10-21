import Multiselect from 'vue-multiselect';
import PerfectScrollbar from 'perfect-scrollbar';

const MultiselectScrollMixin = {
    data() {
        return {
            _listDOM: null,
            _ps: null,
        };
    },
    methods: {
        getScrollRoot() {
            let vm = this as any;
            let listRef = (vm.$refs.list as Element) || null;
            return listRef || null;
        },
        attachScroll: function() {
            let vm = this as any;
            let root = vm.getScrollRoot();
        
            if (vm._listDOM) {
                if (vm._listDOM === root) {
                    vm._listDOM.classList.add('ps');
                    vm._ps && vm._ps.update();
                    return;
                }
        
                vm.detachScroll(); // and attach again
            }
        
            if (!root) {
                return;
            }
        
            vm._listDOM = root;
            vm._ps = new PerfectScrollbar(root);
            vm._listDOM.classList.add('ps');
        },
        detachScroll() {
            let vm = this as any;
            if (!vm._listDOM) {
                return;
            }
    
            vm._ps && vm._ps.destroy();
            vm._listDOM = null;
            vm._ps = null;
        }
    },
    mounted() {
        let vm = this as any;
        vm.attachScroll();
    },
    updated() {
        let vm = this as any;
        vm.$nextTick(() => {
            vm.detachScroll(); // force update
            vm.attachScroll();
        });
    },
    beforeDestroy() {
        let vm = this as any;
        vm.detachScroll();
    }
};
export default {
    ...Multiselect as any,
    mixins: [
        ...(Multiselect as any).mixins,
        MultiselectScrollMixin,
    ],
};
