<template>
    <div class="lobby-form">
        <div v-if="lobbyPopup" class="light-div">
            <div>
                <label
                    ><i>Lobby</i>
                    <span>{{ lobby ? lobby.id : "..." }}</span></label
                >
                <div style="clear: both" />
            </div>
            <div>
                <label
                    ><i>Host</i>
                    <span>{{ lobby ? lobby.host.name : "..." }}</span></label
                >
                <div style="clear: both" />
            </div>
            <div>
                <label
                    ><i>Guest</i
                    ><span>
                        {{
                            lobby && lobby.guest
                                ? lobby.guest.name
                                : lobby && lobby.public === "false"
                                ? "AI"
                                : "..."
                        }}
                    </span></label
                >
                <div style="clear: both" />
            </div>
            <div>
                <label><i>Host color</i> </label>
                <select v-model="hostColor" :disabled="!configEnabled()">
                    <option value="w">white</option>
                    <option value="b">black</option>
                </select>
                <div style="clear: both" />
            </div>
            <div>
                <label><i>Public</i> </label>
                <select v-model="public" :disabled="!configEnabled()">
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
                <div style="clear: both" />
            </div>
            <div>
                <label><i>Time limit</i> </label>
                <input
                    placeholder="Time limit"
                    v-model="timeLimit"
                    type="number"
                    :disabled="!configEnabled()"
                />
                <div style="clear: both" />
            </div>
        </div>
        <div class="controls-div">
            <button @click="lobbyPopup = !lobbyPopup">
                {{ lobbyPopup ? "Hide" : "Show" }}
            </button>
            <button @click="leave" :disabled="!lobby">Leave</button>
            <button
                @click="lobby ? start() : create()"
                :disabled="(lobby && !canStart()) || (!lobby && !canCreate())"
            >
                {{ lobby ? "Start" : "Create" }}
            </button>
        </div>
    </div>
</template>

<script>
import Network from "@/modules/network";
import Store from "@/modules/storage";

export default {
    props: [],
    emits: [],
    data() {
        return {
            hostColor: "w",
            public: "true",
            timeLimit: 900,
            lobbyPopup: true,
        };
    },
    computed: {
        lobby() {
            [Store.state.user];

            const lobby = Store.lobby();

            if (lobby) {
                this.hostColor = lobby.host_color;
                this.public = lobby.public;
                this.timeLimit = lobby.time_limit;
            }

            return lobby;
        },
    },
    methods: {
        create() {
            Network.makeLobby(this.hostColor, this.public, this.timeLimit);
        },
        start() {
            Network.startLobby();
        },
        leave() {
            Network.leaveLobby();
        },
        isHost() {
            return (
                this.lobby &&
                Store.state.user &&
                this.lobby.host.id === Store.state.user.id
            );
        },
        configEnabled() {
            return !this.isLobbyOpen();
        },
        isLobbyOpen() {
            return this.lobby && this.lobby.status === "open";
        },
        canCreate() {
            return !this.isHost() || !this.isLobbyOpen();
        },
        canStart() {
            return (
                this.isLobbyOpen() &&
                this.isHost() &&
                (this.lobby.guest || this.lobby.public === "false")
            );
        },
    },
    // created() {
    //     Network.listen(null, 'newLobbyId', (event) => this.lobbyId = event.message)
    // }
};
</script>
