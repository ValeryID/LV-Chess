<template>
    <div class='login-form'>
        <div></div>
        <input placeholder='email' v-model='email' type='email'/>
        <input placeholder='password' v-model='password' type='password'/>
        <span :class="[{'dot-active': loggedin}, 'dot']"></span>
        <button @click='login'>Login</button>
    </div>
</template>

<script>
export default {
    props: ['loggedin'],
    emits: ['login'],
    data() {
        return {
            email: 'test@mail.com',
            password: 'testpassword'
        }
    },
    methods: {
        login() {
            this.$emit('login', {
                email: this.email,
                password: this.password
            })
        }
    }
}
</script>