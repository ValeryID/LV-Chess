<template>
    <div class="chat">
        <div class="chat-messages">
            <text v-for="message in messages">
                <b>{{ `${message.name}: ` }}</b>
                {{ message.text }}<br />
            </text>
        </div>
        <div class="controls-div">
            <input @keyup.prevent="onKeyUp" v-model="message" type="text" />
            <button @click="send">Send</button>
        </div>
    </div>
</template>

<script>
import Network from "@/modules/network";

export default {
    props: [],
    emits: [],
    data() {
        return {
            messages: [],
            message: "",
        };
    },
    methods: {
        send() {
            Network.sendChatMessage(this.message);
            this.message = "";
        },
        onKeyUp(e) {
            if (e.keyCode === 13) this.send();
        },
    },
    created() {
        Network.listen("LobbyEvent", "chatMessage", (event) =>
            this.messages.push(event.message)
        );
    },
};
</script>
