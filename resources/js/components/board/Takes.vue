<template>
    <div class="takes">
        <canvas id="takes-canvas" width="520" height="75"></canvas>
    </div>
</template>

<script>
import Renderer from "@/modules/renderer";
import Store from "@/modules/storage";

export default {
    props: ["takes"],
    emits: [],
    watch: {
        takes(takes) {
            this.render();
        },
    },
    methods: {
        render() {
            if (!this.takes) return;

            this.clear();

            let white_takes = 0,
                black_takes = 0;
            for (const take of this.takes) {
                const numberColor = take.color === "w";
                this.renderPiece(
                    "pqrbkn".indexOf(take.type),
                    !numberColor,
                    numberColor ? white_takes++ : black_takes++,
                    numberColor
                );
            }
        },
        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        renderPiece(sx, sy, bx, by) {
            this.ctx.drawImage(
                Store.state.spriteSheet,
                sx * 100,
                sy * 100,
                100,
                100,
                bx * this.pieceSize,
                by * this.pieceSize,
                this.pieceSize,
                this.pieceSize
            );
        },
    },
    mounted() {
        this.pieceSize = 40;

        this.canvas = this.$el.querySelector("#takes-canvas");
        this.container = this.$el.querySelector(".takes");

        this.ctx = this.canvas.getContext("2d");

        Store.state.spriteSheet.addEventListener("load", () => this.render());
        this.render();
    },
};
</script>
