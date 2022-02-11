<template>
    <div class='lobby-list' @click='test'>
        <div class="slider-div">
            <div v-if='openLobbies().length > 0'>
                <template v-for='lobby in lobbies'>
                    <button v-if="lobby.status === 'open'" @click='join(lobby.id)' class='lobby-list-item'>
                        {{`${lobby.id}. (${1 + (lobby.guest !== null)}/2)`}}<br>
                        {{`Host: ${lobby.host.name}`}}<br>
                        {{`Host color: "${lobby.host_color}"`}}<br>
                        {{`Time limit: ${lobby.time_limit}`}}
                    </button>
                </template>
            </div>
            <b v-else>No lobbies found</b>
        </div>
        <slot></slot>
    </div>
</template>

<script>
import Network from '@/modules/network'
import Store from '@/modules/storage'

export default {
    props: [],
    emits: [],
    data() {
        return {
        }
    },
    computed: {
        lobbies() {
            return Store.state.lobbies
        },
    },
    methods: {
        join(lobbyId, resume=false) {
            console.log('join', lobbyId, resume)
            Network.joinLobby(lobbyId, resume)
        },
        openLobbies() {
            return Store.openLobbies()
        }
    },
    created() {
        Network.getLobbies().then(lobbies => Store.state.lobbies = lobbies).then(()=>{
            for(let lobby of Store.state.lobbies) {
                if(lobby.status !== 'closed' &&
                !Store.state.lobbyId && 
                Store.state.user && 
                [lobby.host.id, lobby.guest?lobby.guest.id:{}].includes(Store.state.user.id)) 
                    this.join(lobby.id, true);
            }
        })
        
        Network.listen('LobbyEvent', 'created', (event) => Store.state.lobbies.push(event.lobby))
        Network.listen('LobbyEvent', 'updated', (event) => {
            Store.state.lobbies = Store.state.lobbies.map(
                lobby => lobby.id === event.lobby.id ? event.lobby : lobby)
        })
    }
}
</script>