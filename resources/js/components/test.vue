<template>
    <input type="text" v-on:input="setMessage" />
    <p>{{message}}</p>
</template>

<script>
export default {
    data() {
        return {
            message: 'Hello Vue 356745!'
        }
        },
    methods: {
        setMessage(event) {
            this.message = event.target.value;
        }
    }
}
</script>