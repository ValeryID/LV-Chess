require('./bootstrap')
let Vue = require('vue')

import Echo from 'laravel-echo'

import Network from '@/modules/network'
import VueApp from '@/vueApp.js'
import Store from '@/modules/storage'

import lobbyListComponent from '@/components/LobbyList.vue'
import loginComponent from '@/components/Login.vue'
import lobbyComponent from '@/components/Lobby.vue'
import chatComponent from '@/components/Chat.vue'
import boardComponent from '@/components/board/Board.vue'

window.Pusher = require('pusher-js');

async function initNetwork() {
    await Network.init(new Echo({
        broadcaster: 'pusher',
        key: 'wbe54yw45yw3',
        wsHost: window.location.hostname,
        wsPort: 8001,
        forceTLS: false,
        disableStats: true,
    }))

    Network.ping()
    setInterval(()=>Network.ping(), 30 * 1000)
}

async function initVue() {
    const app = Vue.createApp(VueApp)
    
    app.component('lobbylist', lobbyListComponent)
    app.component('login', loginComponent)
    app.component('lobby', lobbyComponent)
    app.component('chat', chatComponent)
    app.component('board', boardComponent)

    app.use(Store)
    app.mount('#app')
}

async function init() {
    await initNetwork()
    await initVue()
}

document.addEventListener("DOMContentLoaded", init);