import Vuex from 'vuex'

let Store = Vuex.createStore({
    state () {
        return {
          lobbies: [],
          lobbyId: null,
          gameId: null,
          user: null
        }
    },
    mutations: {
        
    }
})

const State = Store.state

Store.findLobbyById = (id, status=[]) => {
    return State.lobbies.find(
        (lobby) => lobby.id === id && (status.length === 0 || status.includes(lobby.status)))
}

Store.lobby = () => Store.findLobbyById(State.lobbyId, ['open', 'started'])

Store.openLobbies = (id) => State.lobbies.filter(lobby => lobby.status === 'open')

export default Store