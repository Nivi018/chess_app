export const engineAssets = `${import.meta.env.BASE_URL}engine/stockfish-19/`

export type EngineWorker = Pick<Worker, 'postMessage' | 'terminate' | 'onmessage' | 'onerror' | 'onmessageerror'>
type Pending<T> = { resolve: (value: T) => void; reject: (error: Error) => void }

/** One UCI search at a time. A reset uses a new worker, so stale bestmove messages cannot cross games. */
export class StockfishClient {
  private worker: EngineWorker
  private ready = false
  private closed = false
  private boot: Pending<void> | null = null
  private search: Pending<string> | null = null
  private timer: ReturnType<typeof setTimeout> | undefined
  readonly initialized: Promise<void>

  constructor(createWorker: () => EngineWorker = () => new Worker(`${engineAssets}stockfish-19-lite-single.js`)) {
    this.worker = createWorker()
    this.initialized = new Promise((resolve, reject) => { this.boot = { resolve, reject } })
    this.worker.onmessage = (event: MessageEvent<unknown>) => {
      if (this.closed || typeof event.data !== 'string') return
      for (const line of event.data.split(/\r?\n/)) this.receive(line.trim())
    }
    this.worker.onerror = () => this.fail(new Error('No se pudo cargar Stockfish.'))
    this.worker.onmessageerror = () => this.fail(new Error('No se pudo leer la respuesta de Stockfish.'))
    this.timer = setTimeout(() => this.fail(new Error('Stockfish tardó demasiado en cargar.')), 30_000)
    this.send('uci')
  }

  private send(command: string) {
    if (this.closed) return
    try { this.worker.postMessage(command) } catch { this.fail(new Error('No se pudo comunicar con Stockfish.')) }
  }

  private receive(line: string) {
    if (line === 'uciok' && this.boot) {
      this.send('setoption name Hash value 16')
      this.send('setoption name Skill Level value 0')
      this.send('ucinewgame')
      this.send('isready')
    } else if (line === 'readyok' && this.boot) {
      clearTimeout(this.timer)
      this.ready = true
      this.boot.resolve()
      this.boot = null
    } else if (line.startsWith('bestmove ') && this.search) {
      const move = line.split(/\s+/)[1]
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) {
        this.fail(new Error('Stockfish no devolvió una jugada válida.'))
        return
      }
      clearTimeout(this.timer)
      const pending = this.search
      this.search = null
      pending.resolve(move)
    }
  }

  bestMove(moves: string[]): Promise<string> {
    if (!this.ready || this.closed || this.search) return Promise.reject(new Error('Stockfish no está disponible.'))
    if (moves.some((move) => !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))) return Promise.reject(new Error('Historial inválido.'))
    return new Promise((resolve, reject) => {
      this.search = { resolve, reject }
      this.timer = setTimeout(() => this.fail(new Error('Stockfish no respondió a tiempo.')), 15_000)
      // Include history rather than only FEN: repetition matters in a real game.
      this.send(`position startpos${moves.length ? ` moves ${moves.join(' ')}` : ''}`)
      this.send('go depth 2 movetime 250')
    })
  }

  private fail(error: Error) {
    if (this.closed) return
    this.closed = true
    this.ready = false
    clearTimeout(this.timer)
    this.boot?.reject(error)
    this.search?.reject(error)
    this.boot = null
    this.search = null
    this.worker.terminate()
  }

  dispose() { this.fail(new Error('Partida cerrada.')) }
}
