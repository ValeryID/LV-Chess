<template>
    <div class='login-form'>
        <div></div>
        <input placeholder='email' type='text'/>
        <input placeholder='password' type='password'/>
        <button>Login</button>
    </div>
</template>

<script>
export default {
    props: ['lobbies'],
    emits: ['lobbyselected'],
    data() {
        return {
            message: 'Hello Vue 356745!'
        }
    },
    methods: {
        lobbySelected(lobby) {
            this.$emit('lobbyselected', lobby.id)
        },
        setMessage(event) {
            this.message = event.target.value;
        },
        log(message) {
            console.log(message)
        }
    }
}
</script>