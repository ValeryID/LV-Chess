import Store from '@/modules/storage'

export default {
    echo: null,
    listeners: [],

    init(echo) {
        this.echo = echo
        this.listeners = []

        this.syncUser()

        this.echo.channel(`lobbies`).listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
    },

    // set user(a) {
    //     this._user = a
    //     this.dispatch({
    //         class: null,
    //         type: 'userChanged',
    //         message: this._user
    //     })
    // },

    // get user() {
    //     return this._user
    // },

    // set lobbyId(a) {
    //     this._lobbyId = a
    //     this.dispatch({
    //         class: null,
    //         type: 'newLobbyId',
    //         message: this._lobbyId
    //     })
    // },

    // get lobbyId() {
    //     return this._lobbyId
    // },

    reset() {
        this.echo.leave(`lobby.${Store.state.lobbyId}`)
        this.echo.leave(`lobby.${Store.state.gameId}`)
        Store.discardUser()
    },

    syncUser() {
        this.getUser().then(user => Store.state.user = user, err => Store.state.user = null)
    },

    sendAxiosRequest(request) {
        return request().then(d=>d, e=>{
            if([401, 419].includes(e.response.status)) Store.state.user = null

            return new Promise((res, rej) => rej(e.response.status))
        })
    },

    post(path, properties={}, config={}) {
        return this.sendAxiosRequest(()=>axios.post(path, properties, config))
    },

    get(path, properties={}, config={}) {
        return this.sendAxiosRequest(()=>axios.get(path, properties, config))
    },
    
    //this.network.listen('GameEvent', 'move', (event)=>this.makeMove(event.message))
    listen(eventClass, type, callback) {
        this.listeners.push({
            class: eventClass,
            type,
            callback
        })
    },

    dispatch(event) {
        for(const listener of this.listeners)
            if(listener.type === event.type && listener.class === event.class)
                listener.callback(event)
    },

    onGameEvent(event) {
        console.log(event)
        this.dispatch(event)

        switch(event.type) {
            case 'created': this.listenGameChannel(event.game.id); break;
        }
    },
    
    onLobbyEvent(event) {
        console.log(event)
        this.dispatch(event)

        switch(event.type) {
            //case 'started': this.listenGameChannel(event.message.id); break;
        }
    },

    listenLobbyChannel(id) {
        if(Store.state.lobbyId) this.echo.leave(`lobby.${Store.state.lobbyId}`)
        Store.state.lobbyId = id
        this.echo.channel(`lobby.${id}`)
            .listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
            .listen('GameEvent', (e)=>this.onGameEvent(e))
    },

    listenGameChannel(id) {
        if(Store.state.gameId) this.echo.leave(`game.${Store.state.gameId}`)
        Store.state.gameId = id
        this.getColor()
        this.echo.channel(`game.${id}`)
            .listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
            .listen('GameEvent', (e)=>this.onGameEvent(e))
    },

    getColor() {
        const promise = this.get(`/game/${Store.state.gameId}/getcolor`)
        promise.then((response)=>this.dispatch({
            class: null,
            type: 'userColor',
            message: response.data
        }))

        return promise
    },

    login(email, password) {
        return this.post('/login', {email: email, password: password})
        .then(resp => Store.state.user = resp.data, err => new Promise((res, rej) => rej(err)))
    },

    logout() {
        const promise = this.post('/logout')

        promise.then(resp => this.reset())

        return promise
    },

    joinLobby(lobbyId) {
        const promise = this.post(`/lobby/${lobbyId}/join`)
        promise.then((response) => {
            this.listenLobbyChannel(response.data.id)
        })
        
        return promise
    },

    makeLobby(hostColor, isPublic, timeLimit) {
        const promise = this.post('/lobby/make', {
            hostColor: hostColor, 
            public: isPublic, 
            timeLimit: timeLimit
        })
        promise.then((response) => {
            Store.state.lobbyId = response.data.id
            this.listenLobbyChannel(Store.state.lobbyId)
        })
        
        return promise
    },

    startLobby(lobbyId=Store.state.lobbyId) {
        return this.post(`/lobby/${lobbyId}/start`)
    },

    leaveLobby() {
        return this.post(`/lobby/leave`).then(resp => Store.state.lobbyId = null)
    },

    sendMove(algebraic) {
        return this.post(`/game/${Store.state.gameId}/move`, { algebraic: algebraic })
    },

    sendTimeOver(color) {
        return this.post(`/game/${Store.state.gameId}/timeover/${color}`)
            .then(data=>console.log(data))
    },

    sendVictory(color) {
        return this.post(`/game/${Store.state.gameId}/victory/${color}`)
            .then(data=>console.log(data))
    },

    sendChatMessage(message) {
        if(!Store.lobby()) return;

        return this.post(`/lobby/${Store.lobby().id}/chat`, { message: message })
    },

    getLobbies() {
        return this.get(`/lobby/list`).then(e => e.data)
    },

    getUser(userId='') {
        return this.get(`/user/${userId}`).then(e => e.data)
    },
}