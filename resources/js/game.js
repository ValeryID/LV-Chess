export default class Game {
    constructor(engine, renderer, network) {
        this.engine = engine
        this.renderer = renderer
        this.network = network

        this.init()
    }

    init() {
        this.reset()

        this.initEventListeners()
        this.initInput()
    }

    reset() {
        this.ceilSelected = null
        this.color = null
        this.engine.reset()
        this.renderer.setBoard(this.engine.board())
        this.renderer.setMove(null)
    }

    setColor(color) {
        this.color = color
    }

    initEventListeners() {
        this.network.listen('GameEvent', 'move', (event)=>this.makeMove(event.message))
        this.network.listen('LobbyEvent', 'started', ()=>this.reset())
        this.network.listen(null, 'userColor', (event)=>this.setColor(event.message))
    }

    initInput() {
        this.renderer.canvas.onclick = (e) => {
            let boardPos = this.renderer.getCeil(e.offsetX, e.offsetY);
            console.log(this.arrayToAlgebraic(boardPos), this.getPiece(boardPos))

            if(this.ceilSelected) {
                let algebraicStart = this.arrayToAlgebraic(this.ceilSelected)
                let algebraicEnd = this.arrayToAlgebraic(boardPos)

                if(this.tryMove(algebraicStart, algebraicEnd)) 
                    this.network.sendMove(algebraicStart + algebraicEnd)
                
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
    }

    algebraicToArray(algebraic) {
        return [algebraic.charCodeAt(0)-'a'.charCodeAt(0), algebraic.charAt(1)-1]
    }

    arrayToAlgebraic(array) {
        return String.fromCharCode('a'.charCodeAt(0)+array[0]) + (array[1]+1)
    }

    getPiece(array) {
        return this.engine.board()[7-array[1]][array[0]]
    }

    tryMove(algebraicStart, algebraicEnd) {
        let move = this.engine.move({ from: algebraicStart, to: algebraicEnd })
        console.log(move)
        if(move) this.engine.undo()
        return move
    }

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
    }

    load(fen) {
        if(this.engine.load(fen)) {
            this.renderer.setBoard(this.engine.board())
            return true
        }

        return false
    }
}