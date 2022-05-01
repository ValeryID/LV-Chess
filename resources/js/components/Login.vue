<template>
    <div v-if="!registerMode" class="login-form">
        <div v-for="error in loginErrors" class="message-info">
            {{ error }}
        </div>
        <div v-if="!user" class="light-div">
            <input placeholder="email" v-model="email" type="email" />
            <input placeholder="password" v-model="password" type="password" />
        </div>
        <div v-else class="message-name">
            {{ user.name }}
        </div>
        <div class="controls-div">
            <span :class="[{ 'dot-active': user }, 'dot']"></span>
            <button v-if="!user" @click="toRegisterMode">Register</button>
            <button v-if="user" @click="logout">Logout</button>
            <button v-if="!user" @click="login">Login</button>
        </div>
    </div>

    <div v-else class="login-form">
        <div v-for="error in validationErrors" class="message-info">
            {{ error }}
        </div>
        <div class="light-div">
            <input placeholder="name" v-model="name" type="email" />
            <input placeholder="email" v-model="email" type="email" />
            <input placeholder="password" v-model="password" type="password" />
        </div>
        <div class="controls-div">
            <button @click="toLoginMode">Cancel</button>
            <button @click="register">Submit</button>
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
            name: "",
            email: "",
            password: "",
            registerMode: false,
            validationErrors: [],
            loginErrors: [],
        };
    },
    computed: {
        user() {
            return Store.state.user;
        },
    },
    methods: {
        login() {
            this.loginErrors = [];
            Network.login(this.email, this.password)
                .then((succ) => true)
                .catch((err) =>
                    this.loginErrors.push(`Wrong ${err.data.reason}`)
                );
        },
        logout() {
            Network.logout();
        },
        toRegisterMode() {
            this.validationErrors = [];
            this.registerMode = true;
        },
        toLoginMode() {
            this.registerMode = false;
        },
        async register() {
            axios({
                method: "post",
                url: "register",
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    name: this.name,
                    password: this.password,
                    email: this.email,
                },
            })
                .then(() => {
                    this.toLoginMode();
                    this.login();
                })
                .catch((err) => {
                    const resp = err.response.data;
                    const errors = resp.errors;
                    this.validationErrors = [];
                    for (const [param, validerrs] of Object.entries(errors))
                        this.validationErrors.push(
                            `${param}: ${validerrs.join(", ")}`
                        );
                    //console.log(err)
                });
            //for(const error in response.errors)
        },
    },
    // created() {
    //     Network.listen(null, 'userChanged', (event) => this.user = event.message)
    // }
};
</script>
