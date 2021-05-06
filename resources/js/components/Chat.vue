<template>
    <div class='chat'>
        <div class='chat-messages'>
            <text v-for='message in messages'>
                <b>{{`${message.name}: `}}</b>
                {{message.text}}<br>
            </text>
        </div>
        <div class='controls-div'>
            <input @keyup.prevent='onKeyUp' v-model='message' type='text'>
            <button @click='sendMessage'>Send</button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['messages'],
    emits: ['message'],
    data() {
        return {
            message: ''
        }
    },
    methods: {
        sendMessage() {
            this.$emit('message', this.message)
            this.message = ''
        },
        onKeyUp(e) {
            if(e.keyCode === 13) this.sendMessage()
        }
    }
}
</script>