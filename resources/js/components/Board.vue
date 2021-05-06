<template>
    <canvas @click='onClick' id='board-canvas' :width='width' :height='width'></canvas>
</template>

<script>
import Renderer from '../renderer';
import Chess from '../lib/chess';

export default {
    props: ['width', 'height', 'spritesheet'],
    emits: ['login'],
    data() {
        return {
            email: 'test@mail.com',
            password: 'testpassword'
        }
    },
    methods: {
        init() {
            this.reset()
        },

        render() {
            this.renderer.render()
        },

        reset() {
            this.ceilSelected = null
            this.color = null
            this.engine.reset()
            this.renderer.setBoard(this.engine.board())
            this.renderer.setMove(null)
        },

        setColor(color) {
            this.color = color
        },

        algebraicToArray(algebraic) {
            return [algebraic.charCodeAt(0)-'a'.charCodeAt(0), algebraic.charAt(1)-1]
        },

        arrayToAlgebraic(array) {
            return String.fromCharCode('a'.charCodeAt(0)+array[0]) + (array[1]+1)
        },

        getPiece(array) {
            return this.engine.board()[7-array[1]][array[0]]
        },

        tryMove(algebraicStart, algebraicEnd) {
            let move = this.engine.move({ from: algebraicStart, to: algebraicEnd })
            console.log(move)
            if(move) this.engine.undo()
            return move
        },

        makeMove(algebraic) {
            let algebraicStart = algebraic.slice(0, 2)
            let algebraicEnd = algebraic.slice(2, 4)

            let take = this.engine.get(algebraicEnd) !== null
            let move = this.engine.move({ from: algebraicStart, to: algebraicEnd })
            
            if(move) {
                let arrayStart = this.algebraicToArray(algebraicStart)
                let arrayEnd = this.algebraicToArray(algebraicEnd)
                this.renderer.setBoard(this.engine.board())
                this.renderer.setMove({start: arrayStart, end: arrayEnd, take: take})
            }

            return move
        },

        load(fen) {
            if(this.engine.load(fen)) {
                this.renderer.setBoard(this.engine.board())
                return true
            }

            return false
        },

        login() {
            this.$emit('login', {
                email: this.email,
                password: this.password
            })
        },

        onClick(e) {
            let boardPos = this.renderer.getCeil(e.offsetX, e.offsetY);
            console.log(this.arrayToAlgebraic(boardPos), this.getPiece(boardPos), this.ceilSelected)

            if(this.ceilSelected) {
                let algebraicStart = this.arrayToAlgebraic(this.ceilSelected)
                let algebraicEnd = this.arrayToAlgebraic(boardPos)

                if(this.tryMove(algebraicStart, algebraicEnd)) 
                    this.$emit('move', algebraicStart + algebraicEnd)
                
                this.ceilSelected = null
                this.renderer.setCursor(null)

            } else {
                let piece = this.getPiece(boardPos)
                if(piece && piece.color === this.color) {
                    this.ceilSelected = boardPos
                    this.renderer.setCursor(this.ceilSelected)
                }
            }
        }
    },
    mounted() {
        this.canvas = document.querySelector('#board-canvas')
        this.renderer = new Renderer(this.canvas, this.spritesheet)
        this.engine = new Chess()

        this.init()
    }
}
</script>