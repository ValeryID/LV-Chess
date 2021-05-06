require('./bootstrap');
let Vue = require('vue');

import Echo from 'laravel-echo';
import Renderer from './renderer';
import Game from './game';
import Chess from './lib/chess';
import Network from './network';
import lobbyListComponent from './components/LobbyList.vue';
import loginComponent from './components/Login.vue';
import lobbyComponent from './components/Lobby.vue';
import chatComponent from './components/Chat.vue';
import boardComponent from './components/Board.vue';

window.Pusher = require('pusher-js');

function initNetwork() {
    return new Network(
        new Echo({
            broadcaster: 'pusher',
            key: 'wbe54yw45yw3',
            wsHost: window.location.hostname,
            wsPort: 6001,
            forceTLS: false,
            disableStats: true,
        })
    )
}

async function initGame() {
    let canvas = document.querySelector('#game_board')
    let spriteSheet = await new Promise((resolve, reject) => {
        let image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject()
        image.src = '/images/spritesheet.png'
    })

    let renderer = new Renderer(canvas, spriteSheet)
    let chess = new Chess()

    return new Game(chess, renderer, network)
}

async function initVue(network) {
    let vueApp = Vue.createApp({
        data() {
            return {
                lobbies: [],
                lobbyid: null,
                messages: [],
                loggedin: true,
                spritesheet: new Image()
            }
        },
        computed: {
        },
        methods: {
            join(lobbyId) {
                network.joinLobby(lobbyId)
            },
            login(credentials) {
                network.login(credentials.email, credentials.password)
                .then(d => this.loggedin = true, e => network.getUser())
            },
            createLobby(config) {
                network.makeLobby(
                    config.hostColor, 
                    config.public,
                    config.timeLimit)
            },
            startLobby(config) {
                network.startLobby(this.lobbyid)
            },
            sendChatMessage(text) {
                network.sendChatMessage(text)
            },
            initNetwork() {
                network.getLobbies().then(lobbies => this.lobbies = lobbies)
            
                network.listen(null, 'newLobbyId', (event) => this.lobbyid = event.message)
                network.listen(null, 'logout', (event) => this.loggedin = false)
                network.listen('LobbyEvent', 'created', (event) => this.lobbies.push(event.lobby))
                network.listen('LobbyEvent', 'chatMessage', (event) => this.messages.push(event.message))
                network.listen('LobbyEvent', 'updated', (event) => {
                    this.lobbies = this.lobbies.map(lobby => lobby.id === event.lobby.id ? event.lobby : lobby)
                })
                network.listen('LobbyEvent', 'started', (event) => {
                    this.lobbies = this.lobbies.filter((lobby) => lobby.id !== event.lobby.id)
                })

                network.getUser()
            },
            async initBoard() {
                let board = this.$refs.board

                network.listen('GameEvent', 'move', (event)=>board.makeMove(event.message))
                network.listen('LobbyEvent', 'started', ()=>board.reset())
                network.listen(null, 'userColor', (event)=>board.setColor(event.message))

                this.spritesheet = await new Promise((resolve, reject) => {
                    this.spritesheet.onload = () => resolve(this.spritesheet)
                    this.spritesheet.onerror = () => reject()
                    this.spritesheet.src = '/images/spritesheet.png'
                })
                
                board.init()
            },
            boardMove(move) {
                network.sendMove(move)
            }
        },
        async created() {
            this.initNetwork()
        },
        mounted() {
            this.initBoard()
        }
    })

    vueApp.component('lobbylist', lobbyListComponent)
    vueApp.component('login', loginComponent)
    vueApp.component('lobby', lobbyComponent)
    vueApp.component('chat', chatComponent)
    vueApp.component('board', boardComponent)

    vueApp.mount('#app');

}

async function init() {
    let network = initNetwork()
    //await initGame()
    await initVue(network)
}

document.addEventListener("DOMContentLoaded", init);