<template>
    <div class='lobby-form'>
        <div></div>
        <label><b>Lobby: {{lobbyid}}</b></label>
        <select v-model='hostColor'>
            <option value='w'>white</option>
            <option value='b'>black</option>
        </select>
        <select v-model='public'>
            <option value='true'>true</option>
            <option value='false'>false</option>
        </select>
        <input placeholder='Time limit' v-model='timeLimit' type='number'/>
        <button @click='create'>Create</button>
        <button @click='start'>Start</button>
    </div>
</template>

<script>
export default {
    props: ['lobbyid'],
    emits: ['start', 'create'],
    data() {
        return {
            hostColor: 'w',
            public: 'true',
            timeLimit: 900
        }
    },
    methods: {
        create() {
            this.$emit('create', {
                hostColor: this.hostColor,
                public: this.public,
                timeLimit: this.timeLimit
            })
        },
        start() {
            this.$emit('start')
        }
    }
}
</script>