<template>
    <div class='lobby-form'>
        <div></div>
        <label><b>Lobby: {{lobbyId}}</b></label>
        <select v-model='hostColor'>
            <option value='w'>white</option>
            <option value='b'>black</option>
        </select>
        <select v-model='public'>
            <option value='true'>true</option>
            <option value='false'>false</option>
        </select>
        <input placeholder='Time limit' v-model='timeLimit' type='number'/>
        <button @click='create'>Create</button>
        <button @click='start'>Start</button>
    </div>
</template>

<script>
import Network from '../modules/network'

export default {
    props: [],
    emits: [],
    data() {
        return {
            hostColor: 'w',
            public: 'true',
            timeLimit: 900,
            lobbyId: null
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
        }
    },
    created() {
        Network.listen(null, 'newLobbyId', (event) => this.lobbyId = event.message)
    }
}
</script>