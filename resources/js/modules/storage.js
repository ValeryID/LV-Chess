import Vuex from 'vuex'

let Store = Vuex.createStore({
    state () {
        return {
          lobbies: []
        }
    },
    mutations: {
        
    }
})

const State = Store.state

Store.findLobbyById = (id, status=null) => {
    return State.lobbies.find((lobby) => lobby.id === id && (!status || lobby.status===status))
}

Store.openLobbies = (id) => State.lobbies.filter(lobby => lobby.status === 'open')

export default Store