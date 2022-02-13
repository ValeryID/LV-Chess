import Chess from '@/lib/chess'

onmessage = function(e) {
    switch(e.data.method) {
        case 'getMove': postMessage(getMove(e.data.param)); break;
        case 'evalPos': postMessage(evalPos(e.data.param)); break;
    }
}

function getMove(fen) {
    const chess = new Chess(fen)
    const aiMove = calcBestMove(chess).move
    const aiMoveResult = aiMove === null ? null : chess.move(aiMove)
    return aiMoveResult
}

function evalPos(fen) {
    return evalPosition(new Chess(fen))
}

function moveNode(node, move) {
    const newNode = new Chess(node.fen())
    newNode.move(move)
    return newNode
}

function evalPosition(node) {
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

    return score
}

function calcBestMove(node, maxDepth = 3, depth = 0, a = -Infinity, b = Infinity) {
    if(depth === maxDepth) return {
        score: evalPosition(node),
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

    for(const move of node.moves({ verbose: true })) {
        const nextIteration = calcBestMove(moveNode(node, move), maxDepth, depth + 1, a, b)

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

    return {
        score: bestIteration.score,
        move: bestMove,
        moveChain: moveChain
    }
}