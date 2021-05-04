require('./bootstrap');
let Vue = require('vue/dist/vue.esm-bundler.js');

import Echo from 'laravel-echo';
import Renderer from './renderer';
import Game from './game';
import Chess from './lib/chess';
import Network from './network';

window.Pusher = require('pusher-js');

let network;

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

    network = new Network(
        new Echo({
            broadcaster: 'pusher',
            key: 'wbe54yw45yw3',
            wsHost: window.location.hostname,
            wsPort: 6001,
            forceTLS: false,
            disableStats: true,
        })
    )

    return new Game(chess, renderer, network)
}

async function initControls() {
    loginForm.submit_button.onclick = async (e) => {
        try {
            let response = await network.login(loginForm.email.value, loginForm.password.value)
            loginForm.responseLabel.value = response.statusText
        } catch(e) {
            loginForm.responseLabel.value = e
        }
    }

    lobbyForm.join_button.onclick = async (e) => {
        try {
            let response = await network.joinLobby(lobbyForm.lobby.value)
            lobbyForm.responseLabel.value = response.statusText
        } catch(e) {
            lobbyForm.responseLabel.value = e
        }
    }

    lobbyForm.make_button.onclick = async (e) => {
            let response = await network.makeLobby(
                lobbyForm.hostColor.value, 
                lobbyForm.public.value,
                lobbyForm.timeLimit.value)
        try {
            let lobby = response.data
            lobbyForm.responseLabel.value = response.statusText
            lobbyForm.lobby.value = lobby.id
        } catch(e) {
            lobbyForm.responseLabel.value = e
        }
    }

    lobbyForm.start_button.onclick = async (e) => {
        try {
            let response = await network.startLobby(lobbyForm.lobby.value)
            lobbyForm.responseLabel.value = response.statusText
        } catch(e) {
            lobbyForm.responseLabel.value = e
        }
    }

    chatForm.send_button.addEventListener('click', async (e) => {
        network.sendChatMessage(chatForm.message.value)
    })

    chatForm.message.addEventListener('keyup', (e) => {
        if(e.keyCode === 13) {
            e.preventDefault()
            network.sendChatMessage(chatForm.message.value)
            return false
        }
    })
}

function initListeners() {
    network.listen('LobbyEvent', 'chatMessage', (event)=>{
        document.querySelector('#chat_messages').innerHTML += 
        `<b>${event.message.name}</b>: ${event.message.text}<br>`;
    })
}

function initVue() {
    Vue.createApp({
        data() {
          return {
            message: 'Hello Vue 3!'
          }
        },
        methods: {
          setMessage(event) {
            this.message = event.target.value;
          }
        }
      }).mount('#app');
}

async function init() {
    initVue();
    await initGame()
    initControls()
    initListeners()
}

document.addEventListener("DOMContentLoaded", init);