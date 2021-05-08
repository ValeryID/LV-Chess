export default {
    init(canvas, spriteSheet) {
        this.canvas = canvas
        this.spriteSheet = spriteSheet
        this.ctx = this.canvas.getContext('2d')

        this.scale = canvas.width / 800;
        this.spriteWidth = 100
        this.width = this.height = this.spriteWidth * this.scale * 8
        this.pieceSize = this.spriteWidth * this.scale;

        this.board = this.cursor = this.moveStart = this.moveEnd = null;
    },

    clear() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    getCeil(x, y) {
        let transform = (a) => Math.floor(a / (this.spriteWidth * this.scale))
        return [transform(x), 7-transform(y)]
    },

    renderPiece(sx, sy, bx, by) {
        this.ctx.drawImage(this.spriteSheet, 
            sx * this.spriteWidth, sy * this.spriteWidth, 
            this.spriteWidth, this.spriteWidth, 
            bx * this.pieceSize, by * this.pieceSize, 
            this.pieceSize, this.pieceSize)
    },

    resize(sx, sy) {
        let newWidth = 80
        let oldWidth = this.spriteWidth
        this.ctx.drawImage(this.spriteSheet, 
            sx * oldWidth, sy * oldWidth, 
            oldWidth, oldWidth, 
            sx * oldWidth + (oldWidth - newWidth) / 2, sy * oldWidth  + (oldWidth - newWidth) / 2, 
            newWidth, newWidth)
    },

    render() {
        this.renderBoard()
        this.renderCursor()
        this.renderMove()
    },

    renderBoard() {
        if(!this.board) return
        
        this.clear()
        
        for(let y = 0; y < 8; y++) {
            for(let x = 0; x < 8; x++){
                this.renderPiece(6+(x+y)%2, 0, x, y)

                let piece = this.board[y][x]
                if(!piece) continue;

                let sheetY = piece.color !== 'w'
                switch(piece.type) {
                    case 'p': this.renderPiece(0, sheetY, x, y); break;
                    case 'q': this.renderPiece(1, sheetY, x, y); break;
                    case 'r': this.renderPiece(2, sheetY, x, y); break;
                    case 'b': this.renderPiece(3, sheetY, x, y); break;
                    case 'k': this.renderPiece(4, sheetY, x, y); break;
                    case 'n': this.renderPiece(5, sheetY, x, y); break;
                }
            }
        }
        
    },

    renderCursor() {
        if(!this.cursor) return false;

        this.renderPiece(6, 1, this.cursor[0], 7-this.cursor[1])

        return true;
    },

    renderMove() {
        if(!this.move) return

        switch(this.move.type) {
            case 'move': this.ctx.strokeStyle = '#99ff33'; break;
            case 'take': this.ctx.strokeStyle = '#ff6633'; break;
            case 'promotion': this.ctx.strokeStyle = '#8616ab'; break;
        }

        this.ctx.lineWidth = 5;

        this.ctx.beginPath()
        this.ctx.moveTo(
            this.move.start[0] * this.pieceSize + this.pieceSize / 2, 
            this.height - this.move.start[1] * this.pieceSize - this.pieceSize / 2)
        this.ctx.lineTo(
            this.move.end[0] * this.pieceSize + this.pieceSize / 2, 
            this.height - this.move.end[1] * this.pieceSize - this.pieceSize / 2)
        this.ctx.stroke()
    },

    setBoard(board) {
        this.board = board
        this.render()
    },

    setCursor(cursor) {
        this.cursor = cursor
        this.render()
    },

    setMove(move) {
        this.move = move
        this.render()
    },
}