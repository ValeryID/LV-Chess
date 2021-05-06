export default class Network {
    constructor(echo) {
        this.echo = echo

        this.listeners = []
        this.gameId = null

        this.init()
    }

    set lobbyId(a) {
        this._lobbyId = a
        this.dispatch({
            class: null,
            type: 'newLobbyId',
            message: this._lobbyId
        })
    }

    get lobbyId() {
        return this._lobbyId === undefined ? null : this._lobbyId
    }

    sendAxiosRequest(request) {
        return request().then(d=>d, e=>{
            if([401, 419].includes(e.response.status)) this.dispatch({
                class: null,
                type: 'logout'
            })

            return new Promise((res, rej) => rej(e.response.status))
        })
    }

    post(path, properties={}, config={}) {
        return this.sendAxiosRequest(()=>axios.post(path, properties, config))
    }

    get(path, properties={}, config={}) {
        return this.sendAxiosRequest(()=>axios.get(path, properties, config))
    }

    init() {
        this.echo.channel(`lobbies`).listen('LobbyEvent', (e)=>this.onLobbyEvent(e))
    }
    
    //this.network.listen('GameEvent', 'move', (event)=>this.makeMove(event.message))
    listen(eventClass, type, callback) {
        this.listeners.push({
            class: eventClass,
            type,
            callback
        })
    }

    dispatch(event) {
        for(let listener of this.listeners)
            if(listener.type === event.type && listener.class === event.class)
                listener.callback(event)
    }

    onGameEvent(e) {
        console.log(e)
        this.dispatch(e)

        switch(e.type) {
            case 'move': break;
        }
    }
    
    onLobbyEvent(e) {
        console.log(e)
        this.dispatch(e)

        switch(e.type) {
            case 'started': this.listenGameChannel(e.message.id); break;
        }
    }

    listenLobbyChannel(id) {
        if(this.lobbyId) this.echo.leave(`lobby.${this.lobbyId}`)
        this.lobbyId = id
        this.echo.channel(`lobby.${id}`).listen('LobbyEvent', (e)=>this.onLobbyEvent(e));
    }

    listenGameChannel(id) {
        if(this.gameId) this.echo.leave(`game.${this.gameId}`)
        this.gameId = id
        this.getColor()
        this.echo.channel(`game.${id}`).listen('GameEvent', (e)=>this.onGameEvent(e))
    }

    getColor() {
        let promise = this.get(`/game/${this.gameId}/getcolor`)
        promise.then((response)=>this.dispatch({
            class: null,
            type: 'userColor',
            message: response.data
        }))

        return promise
    }

    login(email, password) {
        return this.post('/login', {email: email, password: password})
    }

    joinLobby(lobbyId) {
        let promise = this.post(`/lobby/${lobbyId}/join`)
        promise.then((response) => {
            this.listenLobbyChannel(response.data.id)
        })
        
        return promise
    }

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
    }

    startLobby(lobbyId) {
        return this.post(`/lobby/${lobbyId}/start`)
    }

    sendMove(algebraic) {
        return this.post(`/game/${this.gameId}/move`, { algebraic: algebraic })
    }

    sendChatMessage(message) {
        return this.post(`/lobby/${this.lobbyId}/chat`, { message: message })
    }

    getLobbies() {
        return this.get(`/lobby/list`).then(e => e.data)
    }

    getUser() {
        return this.get(`/user`).then(e => e.data)
    }
}