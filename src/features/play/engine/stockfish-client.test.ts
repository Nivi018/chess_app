import { afterEach, describe, expect, it, vi } from 'vitest'
import { StockfishClient, type EngineWorker } from './stockfish-client'

function fixture() {
  const worker: EngineWorker = { postMessage: vi.fn(), terminate: vi.fn(), onmessage: null, onerror: null, onmessageerror: null }
  const client = new StockfishClient(() => worker)
  const receive = (data: string) => worker.onmessage?.call(worker as Worker, new MessageEvent('message', { data }))
  return { worker, client, receive }
}

afterEach(() => { vi.useRealTimers() })

describe('Stockfish UCI client', () => {
  it('waits for UCI and ready handshakes, configures limited play and sends full history', async () => {
    const { worker, client, receive } = fixture()
    expect(worker.postMessage).toHaveBeenCalledWith('uci')
    receive('uciok')
    expect(worker.postMessage).toHaveBeenCalledWith('setoption name Skill Level value 0')
    expect(worker.postMessage).toHaveBeenCalledWith('ucinewgame')
    expect(worker.postMessage).toHaveBeenLastCalledWith('isready')
    receive('readyok')
    await client.initialized
    const reply = client.bestMove(['e2e4'])
    expect(worker.postMessage).toHaveBeenCalledWith('position startpos moves e2e4')
    expect(worker.postMessage).toHaveBeenLastCalledWith('go depth 2 movetime 250')
    receive('info depth 1 score cp 12\nbestmove e7e5 ponder g1f3')
    expect(await reply).toBe('e7e5')
    client.dispose()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it('rejects overlapping searches, invalid moves and late responses after dispose', async () => {
    const { worker, client, receive } = fixture()
    receive('uciok'); receive('readyok')
    await client.initialized
    await expect(client.bestMove(['not-a-move'])).rejects.toThrow('Historial inválido')
    const first = client.bestMove(['e2e4'])
    await expect(client.bestMove(['d2d4'])).rejects.toThrow('no está disponible')
    const rejection = expect(first).rejects.toThrow('cerrada')
    client.dispose()
    receive('bestmove e7e5')
    await rejection
    client.dispose()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it('times out loading and disposes a broken worker', async () => {
    vi.useFakeTimers()
    const { client, worker } = fixture()
    const rejection = expect(client.initialized).rejects.toThrow('tardó demasiado')
    await vi.advanceTimersByTimeAsync(30_000)
    await rejection
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it('times out a search and rejects malformed bestmove output', async () => {
    vi.useFakeTimers()
    const { client, receive } = fixture()
    receive('uciok'); receive('readyok')
    await client.initialized
    const timeout = expect(client.bestMove(['e2e4'])).rejects.toThrow('no respondió')
    await vi.advanceTimersByTimeAsync(15_000)
    await timeout
    const other = fixture()
    other.receive('uciok'); other.receive('readyok')
    await other.client.initialized
    const invalid = expect(other.client.bestMove(['e2e4'])).rejects.toThrow('no devolvió una jugada válida')
    other.receive('bestmove (none)')
    await invalid
  })

  it('reports worker loading and message failures', async () => {
    const { client, worker } = fixture()
    const failure = expect(client.initialized).rejects.toThrow('cargar')
    worker.onerror?.call(worker as Worker, new ErrorEvent('error'))
    await failure
    const other = fixture()
    other.receive('uciok'); other.receive('readyok')
    await other.client.initialized
    const unreadable = expect(other.client.bestMove(['e2e4'])).rejects.toThrow('leer')
    other.worker.onmessageerror?.call(other.worker as Worker, new MessageEvent('messageerror'))
    await unreadable
  })
})
