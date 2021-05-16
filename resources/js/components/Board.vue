<template>
    <div class='board-container'>
        <div class='board'>
            <div class='canvas-div' :style="{width: canvasWidth + 'px', height: canvasWidth + 'px'}">
                <div class='alert' v-if='!started'>
                    <label v-if='result'><b>{{result}} player wins</b></label>
                </div>
                <div class='shadow'></div>
                <canvas @click='onClick' id='board-canvas' :width='canvasWidth' :height='canvasWidth'/>
            </div>
        </div>
        <div class='gameinfo'>
            <div style='color: white'>Black time: {{Math.max(blackPlayerTime, 0)}}</div>
            <div style='color: white'>White time: {{Math.max(whitePlayerTime, 0)}}</div>
        </div>
    </div>
</template>

<script>
// <div v-if='!started' :style="{width: width + 'px', height: height + 'px'}">
// <div class='shadow' :style="{width: width + 'px', height: height + 'px'}"></div>
import Network from '../modules/network';
import Renderer from '../modules/renderer';
import Store from '../modules/storage';
import Chess from '../lib/chess';

export default {
    props: [],
    emits: [],
    data() {
        return {
            canvasWidth: null,
            spriteSheet: new Image(),
            whitePlayerTime: null,
            blackPlayerTime: null,
            started: false,
            result: null
        }
    },
    methods: {
        calcCanvasWidth() {
            const box = document.querySelector('.board').getBoundingClientRect()
            this.canvasWidth = ~~Math.min(box.width-14, box.height-14)
            Renderer.resetScale()
        },

        init() {
            setInterval(() => {
                if(!this.started) return
                
                if(this.engine.turn() === 'w') {
                    if(this.whitePlayerTime-- <= 0 && this.color === 'b') Network.sendTimeOver('w')
                } else {
                    if(this.blackPlayerTime-- <= 0 && this.color === 'w') Network.sendTimeOver('b')
                }
            }, 1000)
        },

        render() {
            Renderer.render()
        },

        restart() {
            this.started = true
            this.result = null

            this.ceilSelected = null
            this.color = null
            this.engine.reset()
            Renderer.setBoard(this.engine.board())
            Renderer.setMove(null)

            const lobby = Store.lobby()

            if(lobby) {
                console.log('ggg', this.whitePlayerTime = this.blackPlayerTime = lobby.time_limit)
            }
            
        },

        finishGame(result) {
            this.started = false

            switch(result) {
                case 'w': this.result = 'White'; break;
                case 'b': this.result = 'Black'; break;
                default: this.result = '***'; break;
            }
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
            let move = {}
            let result = this.engine.move(move = { from: algebraicStart, to: algebraicEnd })
            if(!result) result = this.engine.move(move = { from: algebraicStart, to: algebraicEnd, promotion: 'q' })
            
            if(result) this.engine.undo()

            return result ? move : null
        },

        makeMove(algebraic) {
            const playerColor = this.engine.turn()
            let type = 'move';

            const algebraicStart = algebraic.slice(0, 2)
            const algebraicEnd = algebraic.slice(2, 4)

            if(this.engine.get(algebraicEnd) !== null) type = 'take'

            let move = this.tryMove(algebraicStart, algebraicEnd)
            
            if(move) {
                this.engine.move(move)

                if(move.promotion) type = 'promotion'

                const arrayStart = this.algebraicToArray(algebraicStart)
                const arrayEnd = this.algebraicToArray(algebraicEnd)
                Renderer.setBoard(this.engine.board())
                Renderer.setMove({start: arrayStart, end: arrayEnd, type: type})
            }

            if(this.engine.game_over()) Network.sendVictory(playerColor)

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
            const boundingBox = this.canvas.getBoundingClientRect()
            const boardPos = Renderer.getCeil(
                e.offsetX / boundingBox.width * this.canvas.width, 
                e.offsetY / boundingBox.height * this.canvas.height)

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
        },
    },
    async mounted() {
        clearInterval(this.interval)
        this.interval = setInterval(()=>this.calcCanvasWidth(), 500)
        
        window.addEventListener('resize', (e)=>this.calcCanvasWidth())

        this.canvas = document.querySelector('#board-canvas')
        Renderer.init(this.canvas, this.spriteSheet)
        this.engine = new Chess()

        Network.listen('GameEvent', 'move', (event) => this.makeMove(event.message))
        Network.listen('GameEvent', 'created', () => this.restart())
        //Network.listen('GameEvent', 'result', (event) => this.finishGame(event.message))
        Network.listen('GameEvent', 'updated', (event) => {
            if(event.game.result !== null) this.finishGame(event.game.result)
        })
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