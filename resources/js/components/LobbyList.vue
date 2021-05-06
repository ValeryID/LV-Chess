<template>
    <div class='lobby-list'>
        <button v-if='lobbies.length > 0' v-for='lobby in lobbies' @click='lobbySelected(lobby)' 
        class='lobby-list-item'>
            {{`${lobby.id}. ${1 + (lobby.guest_id !== null)}/2`}}<br>
            {{`Host color:"${lobby.host_color}"`}}<br>
            {{`Time limit:${lobby.time_limit}`}}
        </button>
        <b v-else>No lobbies found</b>
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