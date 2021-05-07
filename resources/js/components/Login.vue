<template>
    <div class='login-form'>
        <div class='light-div'></div>
        <input placeholder='email' v-model='email' type='email'/>
        <input placeholder='password' v-model='password' type='password'/>
        <span :class="[{'dot-active': user}, 'dot']"></span>
        <button @click='login'>Login</button>
    </div>
</template>

<script>
import Network from '../modules/network'

export default {
    props: [],
    emits: [],
    data() {
        return {
            email: 'test@mail.com',
            password: 'testpassword',
            user: Network.user
        }
    },
    methods: {
        login() {
            Network.login(this.email, this.password)
        }
    },
    created() {
        Network.listen(null, 'userChanged', (event) => this.user = event.message)
    }
}
</script>