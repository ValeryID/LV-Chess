<template>
    <div class='login-form'>
        <div class='light-div'>
            <input placeholder='email' v-model='email' type='email'/>
            <input placeholder='password' v-model='password' type='password'/>
        </div>
        <div class='controls-div'>
            <span :class="[{'dot-active': user}, 'dot']"></span>
            <button @click='logout'>Logout</button>
            <button @click='login'>Login</button>
        </div>
    </div>
</template>

<script>
import Network from '@/modules/network'
import Store from '@/modules/storage'

export default {
    props: [],
    emits: [],
    data() {
        return {
            email: 'test@mail.com',
            password: 'testpassword'
        }
    },
    computed: {
        user() {
            return Store.state.user
        }
    },
    methods: {
        login() {
            Network.login(this.email, this.password)
        },
        logout() {
            Network.logout()
        }
    },
    // created() {
    //     Network.listen(null, 'userChanged', (event) => this.user = event.message)
    // }
}
</script>