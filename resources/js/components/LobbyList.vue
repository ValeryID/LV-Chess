<template>
    <div class='lobby-list'>
        <button v-if='lobbies.length > 0' v-for='lobby in lobbies' @click='join(lobby.id)' 
        class='lobby-list-item'>
            {{`${lobby.id}. ${1 + (lobby.guest_id !== null)}/2`}}<br>
            {{`Host color:"${lobby.host_color}"`}}<br>
            {{`Time limit:${lobby.time_limit}`}}
        </button>
        <b v-else>No lobbies found</b>
    </div>
</template>

<script>
import Network from '../modules/network';

export default {
    props: [],
    emits: [],
    data() {
        return {
            lobbies: []
        }
    },
    methods: {
        join(lobbyId) {
            Network.joinLobby(lobbyId)
        }
    },
    created() {
        Network.getLobbies().then(lobbies => this.lobbies = lobbies)
        
        Network.listen('LobbyEvent', 'created', (event) => this.lobbies.push(event.lobby))
        Network.listen('LobbyEvent', 'updated', (event) => {
            this.lobbies = this.lobbies.map(lobby => lobby.id === event.lobby.id ? event.lobby : lobby)
        })
        Network.listen('LobbyEvent', 'started', (event) => {
            this.lobbies = this.lobbies.filter((lobby) => lobby.id !== event.lobby.id)
        })
    }
}
</script>