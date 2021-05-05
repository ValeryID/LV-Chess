<template>
    <div class='lobby-list'>
        <div v-if='lobbies.length > 0' v-for='lobby in lobbies' @click='lobbySelected(lobby)' class='lobby-list-item'>
            {{`${lobby.id} | ${1 + (lobby.guest_id !== null)}/2 | 
            Host color:"${lobby.host_color}" | 
            Time limit:${lobby.time_limit}`}}
        </div>
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