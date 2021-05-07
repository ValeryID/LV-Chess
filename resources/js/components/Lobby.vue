<template>
    <div class='lobby-form'>
        <div class='light-div'></div>
        <label><b>Lobby: {{lobby ? lobby.id : '...'}}<br></b></label>
        <label><b>Host: {{lobby ? lobby.host.name : '...'}}<br></b></label>
        <label><b>Guest: {{lobby&&lobby.guest ? lobby.guest.name : '...'}}</b></label>
        <label><b>Host color: </b></label>
        <select v-model='hostColor' :disabled='!configEnabled()'>
            <option value='w'>white</option>
            <option value='b'>black</option>
        </select>
        <label><b>Public: </b></label>
        <select v-model='public' :disabled='!configEnabled()'>
            <option value='true'>true</option>
            <!--<option value='false'>false</option>-->
        </select>
        <label><b>Time limit: </b></label>
        <input placeholder='Time limit' v-model='timeLimit' type='number' :disabled='!configEnabled()'/>
        <button @click='create' :disabled='isHost() && isLobbyOpen()'>Create</button>
        <button @click='start' :disabled='!isLobbyOpen() || !isHost() || !lobby.guest'>Start</button>
        <button @click='leave' :disabled='!isLobbyOpen()'>Leave</button>
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
            hostColor: 'w',
            public: 'true',
            timeLimit: 900,
            lobbyId: null,
        }
    },
    computed: {
        lobby() {
            const lobby = Store.findLobbyById(this.lobbyId)

            if(lobby) {
                this.hostColor = lobby.host_color
                this.public = lobby.public
                this.timeLimit = lobby.time_limit
            }

            return lobby
        }
    },
    methods: {
        create() {
            Network.makeLobby(
                this.hostColor, 
                this.public,
                this.timeLimit)
        },
        start() {
            Network.startLobby()
        },
        leave() {
            Network.leaveLobby()
        },
        isHost() {
            return this.lobby && this.lobby.host.id === Network.user.id
        },
        configEnabled() {
            return !this.isLobbyOpen()
        },
        isLobbyOpen() {
            return this.lobby && this.lobby.status === 'open'
        }
    },
    created() {
        Network.listen(null, 'newLobbyId', (event) => this.lobbyId = event.message)
    }
}
</script>