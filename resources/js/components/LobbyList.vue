<template>
    <div class='lobby-list' @click='test'>
        <div v-if='lobbies.length > 0'>
            <template v-for='lobby in lobbies'>
                <button v-if="lobby.status === 'open'" @click='join(lobby.id)' class='lobby-list-item'>
                    {{`${lobby.id}. ${1 + (lobby.guest !== null)}/2`}}<br>
                    {{`Host color:"${lobby.host_color}"`}}<br>
                    {{`Time limit:${lobby.time_limit}`}}
                </button>
            </template>
        </div>
        <b v-else>No lobbies found</b>
    </div>
</template>

<script>
import Network from '../modules/network'
import Store from '../modules/storage'

export default {
    props: [],
    emits: [],
    data() {
        return {
        }
    },
    computed: {
        lobbies() {
            for(let lobby of Store.state.lobbies) {
                if(lobby.status === 'open' &&
                !Network.lobbyId && 
                Network.user && 
                Network.user.id === lobby.host.id) 
                    this.join(lobby.id);
            }
            
            return Store.state.lobbies
        },
    },
    methods: {
        join(lobbyId) {
            Network.joinLobby(lobbyId)
        },
        test() {
            console.log(this.lobbies)
        }
    },
    created() {
        Network.getLobbies().then(lobbies => Store.state.lobbies = lobbies)
        
        Network.listen('LobbyEvent', 'created', (event) => Store.state.lobbies.push(event.lobby))
        Network.listen('LobbyEvent', 'updated', (event) => {
            Store.state.lobbies = Store.state.lobbies.map(
                lobby => lobby.id === event.lobby.id ? event.lobby : lobby)
            // if(['started', 'closed'].includes(event.lobby.status))
            //     Store.state.lobbies = Store.state.lobbies.filter((lobby) => lobby.id !== event.lobby.id)
        })
        // Network.listen('LobbyEvent', 'started', (event) => {
        //     Store.state.lobbies = Store.state.lobbies.filter((lobby) => lobby.id !== event.lobby.id)
        // })
    }
}
</script>