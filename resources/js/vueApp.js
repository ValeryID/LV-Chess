import Network from './modules/network'
import Store from './modules/storage'

const widescreenCap = 1000

export default {
    data() {
        return {
            screen: 'Login&Chat',
        }
    },
    computed: {
        widescreen() {
            return Store.state.widescreen
        }
    },
    methods: {
        widescreenCheck() {
            Store.state.widescreen = window.innerWidth > widescreenCap
        }
    },
    created() {
    },
    mounted() {
        window.addEventListener('resize', (e)=>this.widescreenCheck())

        this.widescreenCheck()
    }
}