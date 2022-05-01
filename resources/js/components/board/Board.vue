<template>
    <div class="board-container">
        <div class="board flex-horizontal-square" id="board">
            <div class="alert" v-if="!started">
                <label v-if="result"
                    ><b>{{ result }} player wins</b></label
                >
            </div>
            <div class="canvas-container">
                <canvas width="1" height="1"></canvas>
                <div class="shadow" id="shadow-div"></div>
                <img
                    class="canvas-image"
                    id="board-canvas"
                    @click="onClick"
                    draggable="false"
                />
            </div>
        </div>
        <div class="gameinfo">
            <div style="color: white">
                Black time: {{ Math.max(blackPlayerTime, 0) }}
            </div>
            <div style="color: white">
                White time: {{ Math.max(whitePlayerTime, 0) }}
            </div>
            <Takes :takes="takes"></Takes>
        </div>
    </div>
</template>

<script>
// <div v-if='!started' :style="{width: width + 'px', height: height + 'px'}">
// <div class='shadow' :style="{width: width + 'px', height: height + 'px'}"></div>
import Network from "@/modules/network";
import Renderer from "@/modules/renderer";
import Store from "@/modules/storage";
import AI from "@/modules/ai";
import Chess from "@/lib/chess";

import Takes from "@/components/board/Takes.vue";

export default {
    props: [],
    emits: [],
    components: {
        Takes,
    },
    data() {
        return {
            canvasWidth: 800,
            whitePlayerTime: null,
            blackPlayerTime: null,
            started: false,
            result: null,
            takes: [],
        };
    },
    methods: {
        init() {
            if (this.tickInterval) clearInterval(this.tickInterval);
            this.tickInterval = setInterval(() => {
                if (!this.started) return;

                if (this.engine.turn() === "w") {
                    if (this.whitePlayerTime-- <= 0 && this.color === "b")
                        Network.sendTimeOver("w");
                } else {
                    if (this.blackPlayerTime-- <= 0 && this.color === "w")
                        Network.sendTimeOver("b");
                }
            }, 1000);
        },

        render() {
            this.renderer.render();
        },

        updateBoardOrientationClass() {
            const boundingBox = this.board.getBoundingClientRect();
            if (boundingBox.width > boundingBox.height)
                this.board.className = "board flex-horizontal-square";
            else this.board.className = "board flex-vertical-square";
        },

        restart(gameState = null) {
            this.started = true;
            this.result = null;

            this.ceilSelected = null;
            this.color = null;
            this.engine.reset();
            this.renderer.setBoard(this.engine.board());
            this.renderer.setMove(null);
            this.takes = [];

            const lobby = Store.lobby();

            if (lobby) {
                this.whitePlayerTime = this.blackPlayerTime = lobby.time_limit;
                if (lobby.guest === null && lobby.host_color === "b")
                    this.makeAiMove();
            }

            if (gameState) {
                //this.started = true
                this.whitePlayerTime = gameState.white_time;
                this.blackPlayerTime = gameState.black_time;
                for (const move of gameState.moves)
                    this.makeMove(move.algebraic);
            }
        },

        myTurn() {
            return this.engine.turn() === this.color;
        },

        finishGame(result) {
            this.started = false;

            switch (result) {
                case "w":
                    this.result = "White";
                    break;
                case "b":
                    this.result = "Black";
                    break;
                default:
                    this.result = "***";
                    break;
            }
        },

        setColor(color) {
            this.color = color;
        },

        algebraicToArray(algebraic) {
            return [
                algebraic.charCodeAt(0) - "a".charCodeAt(0),
                algebraic.charAt(1) - 1,
            ];
        },

        arrayToAlgebraic(array) {
            return (
                String.fromCharCode("a".charCodeAt(0) + array[0]) +
                (array[1] + 1)
            );
        },

        getPiece(array) {
            return this.engine.board()[7 - array[1]][array[0]];
        },

        separateAlgebraic(algebraic) {
            const algebraicStart = algebraic.slice(0, 2);
            const algebraicEnd = algebraic.slice(2, 4);
            return [algebraicStart, algebraicEnd];
        },

        tryMove(algebraic) {
            let result,
                move = {};
            if (["O-O-O", "O-O"].includes(algebraic)) {
                result = this.engine.move((move = algebraic));
                if (result) this.engine.undo();
            } else {
                const [algebraicStart, algebraicEnd] =
                    this.separateAlgebraic(algebraic);
                result = this.engine.move(
                    (move = { from: algebraicStart, to: algebraicEnd })
                );
                if (!result)
                    result = this.engine.move(
                        (move = {
                            from: algebraicStart,
                            to: algebraicEnd,
                            promotion: "q",
                        })
                    );
                if (result) this.engine.undo();
            }

            return result ? move : null;
        },

        makeMove(algebraic) {
            const playerColor = this.engine.turn();
            const castling = ["O-O-O", "O-O"].includes(algebraic);
            let type = "move";
            let move = null;

            if (castling) {
                move = this.tryMove(algebraic);

                if (move) {
                    this.engine.move(move);
                    const moveY = playerColor === "w" ? 0 : 7;
                    const moveX = algebraic === "O-O-O" ? 2 : 5;

                    this.renderer.setMove({
                        start: [moveX, moveY],
                        end: [moveX + 1, moveY],
                        type: "promotion",
                    });
                }
            } else {
                const [algebraicStart, algebraicEnd] =
                    this.separateAlgebraic(algebraic);

                if (this.engine.get(algebraicEnd) !== null) {
                    type = "take";
                    this.takes = [...this.takes, this.engine.get(algebraicEnd)];
                }

                move = this.tryMove(algebraic);

                if (move) {
                    this.engine.move(move);

                    if (move.promotion) type = "promotion";

                    const arrayStart = this.algebraicToArray(algebraicStart);
                    const arrayEnd = this.algebraicToArray(algebraicEnd);

                    this.renderer.setMove({
                        start: arrayStart,
                        end: arrayEnd,
                        type: type,
                    });
                }
            }

            this.renderer.setBoard(this.engine.board());

            if (this.engine.game_over()) Network.sendVictory(playerColor);

            return move;
        },

        load(fen) {
            if (this.engine.load(fen)) {
                this.renderer.setBoard(this.engine.board());
                return true;
            }

            return false;
        },

        onlineGame() {
            return Store.lobby().public === "true";
        },

        async makeAiMove() {
            const aiMove = await AI.getAlgebraicMove(this.engine.fen());
            if (aiMove === null) this.finishGame(Store.lobby().host_color);
            else {
                this.makeMove(aiMove);
                if (!this.engine.moves().length)
                    this.finishGame(
                        Store.lobby().host_color === "w" ? "b" : "w"
                    );
            }
        },

        isCastling(algebraicStart, algebraicEnd) {
            if (
                this.engine.get(algebraicStart) &&
                this.engine.get(algebraicEnd) &&
                this.engine.get(algebraicStart).color ===
                    this.engine.get(algebraicEnd).color &&
                ((this.engine.get(algebraicStart).type === "r" &&
                    this.engine.get(algebraicEnd).type === "k") ||
                    (this.engine.get(algebraicStart).type === "k" &&
                        this.engine.get(algebraicEnd).type === "r"))
            ) {
                if (algebraicStart[0] === "a" || algebraicEnd[0] === "a")
                    return "O-O-O";
                if (algebraicStart[0] === "h" || algebraicEnd[0] === "h")
                    return "O-O";
            }

            return null;
        },

        async onClick(e) {
            const boundingBox = this.canvas.getBoundingClientRect();
            const boardPos = this.renderer.getCeil(
                (e.offsetX / boundingBox.width) * this.canvasWidth,
                (e.offsetY / boundingBox.height) * this.canvasWidth
            );

            const piece = this.getPiece(boardPos);

            if (this.ceilSelected) {
                let algebraicStart = this.arrayToAlgebraic(this.ceilSelected);
                let algebraicEnd = this.arrayToAlgebraic(boardPos);

                const castlingMove = this.isCastling(
                    algebraicStart,
                    algebraicEnd
                );

                let myMove = null;

                if (castlingMove) myMove = castlingMove;
                else myMove = algebraicStart + algebraicEnd;

                this.ceilSelected = null;
                this.renderer.setCursor(null);

                if (this.tryMove(myMove)) {
                    if (this.onlineGame()) {
                        Network.sendMove(myMove);
                    } else {
                        this.makeMove(myMove);
                        await this.makeAiMove();
                    }
                }
            } else {
                if (piece && piece.color === this.color) {
                    this.ceilSelected = boardPos;
                    this.renderer.setCursor(this.ceilSelected);
                }
            }
        },
    },
    async mounted() {
        this.canvas = this.$el.querySelector("#board-canvas");
        this.board = this.$el.querySelector("#board");

        window.renderer = this.renderer = new Renderer(
            this.canvas,
            Store.state.spriteSheet,
            this.canvasWidth,
            this.canvasWidth
        );
        window.engine = this.engine = new Chess();

        this.updateBoardOrientationClass();
        window.addEventListener("resize", () => {
            setTimeout(() => this.updateBoardOrientationClass(), 200);
        });

        Network.listen(null, "resume", (event) => this.restart(event.message));
        Network.listen("GameEvent", "move", (event) =>
            this.makeMove(event.message)
        );
        Network.listen("GameEvent", "created", () => this.restart());
        //Network.listen('GameEvent', 'result', (event) => this.finishGame(event.message))
        Network.listen("GameEvent", "updated", (event) => {
            if (event.game.result !== null) this.finishGame(event.game.result);
        });
        Network.listen(null, "userColor", (event) =>
            this.setColor(event.message)
        );

        Store.state.spriteSheet = await new Promise((resolve, reject) => {
            Store.state.spriteSheet.onload = () =>
                resolve(Store.state.spriteSheet);
            Store.state.spriteSheet.onerror = () => reject();
            Store.state.spriteSheet.src = "/images/spritesheet.png";
        });

        this.init();
    },
};
</script>
