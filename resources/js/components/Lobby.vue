<template>
    <div class='lobby-form'>
        <div class='light-div'>
            <div><label><i>Lobby</i> <span>{{lobby ? lobby.id : '...'}}</span></label></div>
            <div><label><i>Host</i> <span>{{lobby ? lobby.host.name : '...'}}</span></label></div>
            <div><label><i>Guest</i> <span>{{lobby&&lobby.guest ? lobby.guest.name : '...'}}</span></label></div>
            <div>
                <label><i>Host color</i> </label>
                <select v-model='hostColor' :disabled='!configEnabled()'>
                    <option value='w'>white</option>
                    <option value='b'>black</option>
                </select>
                <div style="clear: both"/>
            </div>
            <div>
                <label><i>Public</i> </label>
                <select v-model='public' :disabled='!configEnabled()'>
                    <option value='true'>true</option>
                    <!--<option value='false'>false</option>-->
                </select>
                <div style="clear: both"/>
            </div>
            <div>
                <label><i>Time limit</i> </label>
                <input placeholder='Time limit' v-model='timeLimit' type='number' :disabled='!configEnabled()'/>
                <div style="clear: both"/>
            </div>
        </div>
        <div class='controls-div'>
            <button @click='leave' :disabled='!isLobbyOpen()'>Leave</button>
            <button @click='start' :disabled='!isLobbyOpen() || !isHost() || !lobby.guest'>Start</button>
            <button @click='create' :disabled='isHost() && isLobbyOpen()'>Create</button>
        </div>
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
        }
    },
    computed: {
        lobby() {
            [Store.state.user, ]

            const lobby = Store.lobby()//Store.findLobbyById(Store.state.lobbyId, 'open')
            console.log(lobby)

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
            return this.lobby && Store.state.user && this.lobby.host.id === Store.state.user.id
        },
        configEnabled() {
            return !this.isLobbyOpen()
        },
        isLobbyOpen() {
            return this.lobby && this.lobby.status === 'open'
        }
    },
    // created() {
    //     Network.listen(null, 'newLobbyId', (event) => this.lobbyId = event.message)
    // }
}
</script>