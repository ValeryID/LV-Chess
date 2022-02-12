import Chess from '@/lib/chess'

onmessage = function(e) {
    switch(e.data.method) {
        case 'getMove': postMessage(getMove(e.data.param)); break;
        case 'evalPos': postMessage(evalPos(e.data.param)); break;
    }
}

function getMove(fen) {
    const ai = new ChessAI(fen)
    const aiMove = ai.alphabeth().move
    const aiMoveResult = aiMove === null ? null : ai.chess.move(aiMove)
    console.log(ai.evalPosition())
    return aiMoveResult
}

function evalPos(fen) {
    const ai = new ChessAI(fen)
    return ai.evalPosition()
}

class ChessAI {
    constructor(fen = null, maxDepth = 3) {
        this.chess = fen ? new Chess(fen) : new Chess()
        this.maxDepth = maxDepth
    }

    evalPosition(node = this.chess) {
        const prices = {
            p: 10,
            r: 30,
            n: 30,
            b: 40,
            q: 100,
            k: 200,
            check: 5,
            checkmate: Infinity,
            guard: 1,
            move: 0.5,
            pawnY: 1
        }
    
        const board = node.board()
        let score = 0
        for(let i = 0; i < 64; i++) {
            const y = Math.floor(i / 8)
            const x = i % 8
            const piece = board[y][x]
            if(piece === null) continue
            const isWhite = piece.color === 'w'

            let price = isWhite ? prices[piece.type] : -prices[piece.type]

            if(piece.type === 'p') {
                if(isWhite) price += (7 - y) * prices.pawnY
                else price -= y * prices.pawnY
            }

            for(const dx of [1, -1]) {
                const dy = isWhite ? 1 : -1
                if(y + dy < 0 || y + dy > 7 || x + dx < 0 || x + dx > 7) continue
                const backPiece = board[y + dy][x + dx]
                if(backPiece === null) continue
                if(backPiece.type === 'p' && backPiece.color === piece.color) 
                price += prices.guard * (isWhite ? 1 : -1)
            }

            score += price
        }

        if(node.in_checkmate()) 
            score += node.turn() === 'w' ? -prices.checkmate : prices.checkmate
        if(node.in_check()) 
            score += node.turn() === 'w' ? -prices.check : prices.check
        
        // score += node.moves().length * (node.turn() === 'w' ? 1 : -1) * prices.move
        // this.swapNodeColors(node)
        // score += node.moves().length * (node.turn() === 'w' ? 1 : -1) * prices.move
        // this.swapNodeColors(node)
    
        return score
    }

    swapNodeColors(node = this.chess) {
        let fen = node.fen()

        if(fen.includes(' w ')) fen = fen.replace(' w ', ' b ')
        else fen = fen.replace(' b ', ' w ')

        node.load(fen)
    }

    print() {
        console.log(this.chess.ascii())
    }

    moveNode(node, move) {
        const newNode = new Chess(node.fen())
        newNode.move(move)
        return newNode
    }

    // minimax(node = this.chess, depth = 0) {
    //     if(depth === this.maxDepth) return {
    //         score: this.evalPosition(node),
    //         move: null
    //     }

    //     const maxing = node.turn() === 'w'

    //     const cmp = maxing ? Math.max : Math.min
    //     let bestScore = maxing ? -Infinity : Infinity
    //     let bestMove = null

    //     for(const move of node.moves()) {
    //         //if(Math.random() > 0.97 ) break
    //         const nextIteration = this.minimax(this.moveNode(node, move), depth + 1)
    //         const newBest = cmp(bestScore, nextIteration.score) === nextIteration.score
    //         if(newBest) {
    //             bestScore = nextIteration.score
    //             bestMove = move
    //         }
    //     }

    //     return {
    //         score: bestScore,
    //         move: bestMove
    //     }
    // }

    alphabeth(node = this.chess, depth = 0, a = -Infinity, b = Infinity) {
        if(depth === this.maxDepth) return {
            score: this.evalPosition(node),
            move: null,
            moveChain: []
        }

        const maxing = node.turn() === 'w'

        const cmp = maxing ? Math.max : Math.min
        
        let bestIteration = {
            score: maxing ? -Infinity : Infinity,
            move: null,
            moveChain: []
        }
        let bestMove = null

        for(const move of node.moves()) {
            const nextIteration = this.alphabeth(this.moveNode(node, move), depth + 1, a, b)

            if(cmp(bestIteration.score, nextIteration.score) === nextIteration.score) {
                bestIteration = nextIteration
                bestMove = move
            }

            if(maxing) {
                if(bestIteration.score > b) break
                a = bestIteration.score
            } else {
                if(bestIteration.score < a) break
                b = bestIteration.score
            }
        }

        const moveChain = [bestMove, ...bestIteration.moveChain]

        if(depth === 0) console.log(moveChain)

        return {
            score: bestIteration.score,
            move: bestMove,
            moveChain: moveChain
        }
    }
}