export default {
    async getAlgebraicMove(fen) {
        return new Promise((resolve, reject) => {
 
            const aiWorker = new Worker(new URL('@/workers/aiWorker.js', import.meta.url))

            aiWorker.onmessage = (e) => {
                const moveResult = e.data
                aiWorker.terminate()
                resolve(moveResult === null ? null : moveResult.from + moveResult.to)
            }
            
            aiWorker.postMessage({
                method: 'getMove',
                param: fen
            })
        })
    },

    async evalPosition(fen) {
        return new Promise((resolve, reject) => {
            const aiWorker = new Worker(new URL('@/workers/aiWorker.js', import.meta.url))

            aiWorker.onmessage = console.log
            
            aiWorker.postMessage({
                method: 'evalPos',
                param: fen
            })
        })
    }
}