<template>
    <div class='board'>
        <canvas @click='onClick' id='board-canvas' :width='width' :height='width'></canvas>
    </div>
</template>

<script>
import Network from '../modules/network';
import Renderer from '../modules/renderer';
import Chess from '../lib/chess';

export default {
    props: [],
    emits: [],
    data() {
        return {
            width: '600',
            height: '600',
            spriteSheet: new Image()
        }
    },
    methods: {
        init() {
            this.reset()
        },

        render() {
            Renderer.render()
        },

        reset() {
            this.ceilSelected = null
            this.color = null
            this.engine.reset()
            Renderer.setBoard(this.engine.board())
            Renderer.setMove(null)
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
                Renderer.setBoard(this.engine.board())
                Renderer.setMove({start: arrayStart, end: arrayEnd, take: take})
            }

            return move
        },

        load(fen) {
            if(this.engine.load(fen)) {
                Renderer.setBoard(this.engine.board())
                return true
            }

            return false
        },

        onClick(e) {
            let boardPos = Renderer.getCeil(e.offsetX, e.offsetY);
            console.log(this.arrayToAlgebraic(boardPos), this.getPiece(boardPos), this.ceilSelected)

            if(this.ceilSelected) {
                let algebraicStart = this.arrayToAlgebraic(this.ceilSelected)
                let algebraicEnd = this.arrayToAlgebraic(boardPos)

                if(this.tryMove(algebraicStart, algebraicEnd)) 
                    Network.sendMove(algebraicStart + algebraicEnd)
                
                this.ceilSelected = null
                Renderer.setCursor(null)

            } else {
                let piece = this.getPiece(boardPos)
                if(piece && piece.color === this.color) {
                    this.ceilSelected = boardPos
                    Renderer.setCursor(this.ceilSelected)
                }
            }
        }
    },
    async mounted() {
        this.canvas = document.querySelector('#board-canvas')
        Renderer.init(this.canvas, this.spriteSheet)
        this.engine = new Chess()

        Network.listen('GameEvent', 'move', (event) => this.makeMove(event.message))
        Network.listen('LobbyEvent', 'started', () => this.reset())
        Network.listen(null, 'userColor', (event) => this.setColor(event.message))

        this.spriteSheet = await new Promise((resolve, reject) => {
            this.spriteSheet.onload = () => resolve(this.spriteSheet)
            this.spriteSheet.onerror = () => reject()
            this.spriteSheet.src = '/images/spritesheet.png'
        })

        this.init()
    }
}
</script>