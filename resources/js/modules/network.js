export default {
    echo: null,
    listeners: [],
    gameId: null,
    _user: null,
    _lobbyId: null,

    init(echo) {
        this.echo = echo
        this.listeners = []
        this.gameId = null

        this.syncUser()

        this.echo.channel(`lobbies`).listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
    },

    set user(a) {
        this._user = a
        this.dispatch({
            class: null,
            type: 'userChanged',
            message: this._user
        })
    },

    get user() {
        return this._user
    },

    set lobbyId(a) {
        this._lobbyId = a
        this.dispatch({
            class: null,
            type: 'newLobbyId',
            message: this._lobbyId
        })
    },

    get lobbyId() {
        return this._lobbyId === undefined ? null : this._lobbyId
    },

    syncUser() {
        this.getUser().then(user => this.user = user, err => this.user = null)
    },

    sendAxiosRequest(request) {
        return request().then(d=>d, e=>{
            if([401, 419].includes(e.response.status)) this.user = null

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
        for(let listener of this.listeners)
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
        if(this.lobbyId) this.echo.leave(`lobby.${this.lobbyId}`)
        this.lobbyId = id
        this.echo.channel(`lobby.${id}`)
            .listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
            .listen('GameEvent', (e)=>this.onGameEvent(e))
    },

    listenGameChannel(id) {
        if(this.gameId) this.echo.leave(`game.${this.gameId}`)
        this.gameId = id
        this.getColor()
        this.echo.channel(`game.${id}`)
            .listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
            .listen('GameEvent', (e)=>this.onGameEvent(e))
    },

    getColor() {
        let promise = this.get(`/game/${this.gameId}/getcolor`)
        promise.then((response)=>this.dispatch({
            class: null,
            type: 'userColor',
            message: response.data
        }))

        return promise
    },

    login(email, password) {
        return this.post('/login', {email: email, password: password})
        .then(resp => this.user = resp.data, err => new Promise((res, rej) => rej(err)))
    },

    joinLobby(lobbyId) {
        let promise = this.post(`/lobby/${lobbyId}/join`)
        promise.then((response) => {
            this.listenLobbyChannel(response.data.id)
        })
        
        return promise
    },

    makeLobby(hostColor, isPublic, timeLimit) {
        let promise = this.post('/lobby/make', {
            hostColor: hostColor, 
            public: isPublic, 
            timeLimit: timeLimit
        })
        promise.then((response) => {
            this.lobbyId = response.data.id
            this.listenLobbyChannel(this.lobbyId)
        })
        
        return promise
    },

    startLobby(lobbyId=this.lobbyId) {
        return this.post(`/lobby/${lobbyId}/start`)
    },

    leaveLobby() {
        this.lobbyId = null
        
        return this.post(`/lobby/leave`)
    },

    sendMove(algebraic) {
        return this.post(`/game/${this.gameId}/move`, { algebraic: algebraic })
    },

    sendChatMessage(message) {
        return this.post(`/lobby/${this.lobbyId}/chat`, { message: message })
    },

    getLobbies() {
        return this.get(`/lobby/list`).then(e => e.data)
    },

    getUser(userId='') {
        return this.get(`/user/${userId}`).then(e => e.data)
    },
}