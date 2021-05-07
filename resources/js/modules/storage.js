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

Store.findLobbyById = (id) => {
    return State.lobbies.find((lobby) => lobby.id === id)
}

export default Store