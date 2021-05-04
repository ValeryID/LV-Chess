export default class Network {
    constructor(echo) {
        this.echo = echo

        this.listeners = []
        this.gameId = null
        this.lobbyId = null

        this.init()
    }

    init() {
        this.echo.channel(`lobbies`).listen('LobbyEvent', (e)=>console.log(e))
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
        this.dispatch(e)

        switch(e.type) {
            case 'move': break;
        }
    }
    
    onLobbyEvent(e) {
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
        let promise = axios.get(`/game/${this.gameId}/getcolor`)
        promise.then((response)=>this.dispatch({
            class: null,
            type: 'userColor',
            message: response.data
        }))

        return promise
    }

    login(email, password) {
        return axios.post('/login', {email: email, password: password})
    }

    joinLobby(lobbyId) {
        let promise = axios.post(`/lobby/${lobbyId}/join`)
        promise.then((response)=>{
            this.listenLobbyChannel(response.data.id)
        })
        
        return promise
    }

    makeLobby(hostColor, isPublic, timeLimit) {
        let promise = axios.post('/lobby/make', {
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
        return axios.post(`/lobby/${lobbyId}/start`)
    }

    sendMove(algebraic) {
        return axios.post(`/game/${this.gameId}/move`, { algebraic: algebraic })
    }

    sendChatMessage(message) {
        return axios.post(`/lobby/${this.lobbyId}/chat`, { message: message })
    }
}