import { useEffect, useMemo, useRef, useState } from 'react'
import type { Square } from 'chess.js'
import { StockfishClient } from '../engine/stockfish-client'
import { gameResult, replayGame } from '../game'
import type { PendingPromotion } from '../../lesson/hooks/use-lesson'
import type { PromotionPiece } from '../../../domain/lesson'
import { loadBrowserComputerGame, saveBrowserComputerGame, type GameStorageState } from '../saved-game'

export type Engine = Pick<StockfishClient, 'initialized' | 'bestMove' | 'dispose'>
const createEngine = () => new StockfishClient()

export function useComputerGame(factory: () => Engine = createEngine) {
  const [loaded] = useState(loadBrowserComputerGame)
  const [moves, setMoves] = useState(loaded.moves)
  const movesRef = useRef(moves)
  const [storageState, setStorageState] = useState<GameStorageState>(loaded.storageState)
  const [restored, setRestored] = useState(loaded.storageState === 'saved' && loaded.moves.length > 0)
  const [recoveryBlocked, setRecoveryBlocked] = useState(loaded.storageState === 'invalid' || loaded.storageState === 'unavailable')
  const [generation, setGeneration] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'thinking' | 'error'>('loading')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('Juegas con blancas. Espera a que el motor esté listo.')
  const [selected, setSelected] = useState<Square | null>(null)
  const [keyboardMove, setKeyboardMove] = useState('')
  const [promotion, setPromotion] = useState<PendingPromotion | null>(null)
  const engine = useRef<Engine | null>(null)
  const game = useMemo(() => replayGame(moves), [moves])
  const result = gameResult(game)
  const finished = Boolean(result)
  const engineAvailable = state === 'ready' || state === 'thinking'
  const canPlay = state === 'ready' && game.turn() === 'w' && !result && !promotion && !recoveryBlocked
  const legalMoves = useMemo(() => game.moves({ verbose: true }), [game])
  const moveOptions = useMemo(() => [...new Map(legalMoves.map((move) => [
    `${move.from}:${move.to}`, { value: `${move.from}:${move.to}`, label: `${move.from} → ${move.to} (${move.san})` },
  ])).values()], [legalMoves])

  useEffect(() => {
    if (finished || recoveryBlocked) { setState('ready'); return }
    let active = true
    let current: Engine
    setState('loading')
    setError('')
    try {
      current = factory()
      engine.current = current
      current.initialized.then(() => {
        if (active) {
          setState('ready')
          setFeedback(replayGame(movesRef.current).turn() === 'b' ? 'Motor listo. Las negras continuarán la partida.' : 'Motor listo. Elige una pieza blanca y su destino, o usa el selector.')
        }
      }).catch((reason: unknown) => {
        if (active) { setState('error'); setError(reason instanceof Error ? reason.message : 'No se pudo iniciar el motor.') }
      })
    } catch {
      setState('error')
      setError('Este navegador no pudo iniciar Stockfish. Comprueba que admite WebAssembly y Web Workers.')
    }
    return () => { active = false; engine.current = null; current?.dispose() }
  }, [factory, generation, finished, recoveryBlocked])

  useEffect(() => {
    if (!engineAvailable || game.turn() !== 'b' || result || !engine.current) return
    const current = engine.current
    const position = game.fen()
    const history = moves
    let active = true
    setState('thinking')
    current.bestMove(history).then((move) => {
      if (!active || movesRef.current !== history) return
      const next = replayGame(history)
      if (next.fen() !== position) return
      let played
      try { played = next.move(move) } catch { throw new Error('El motor devolvió una jugada ilegal. Reintenta sin perder la posición.') }
      const updated = [...history, move]
      commitMoves(updated)
      setFeedback(`Negras: ${played.from} → ${played.to} (${played.san}). ${gameResult(next) ?? (next.isCheck() ? 'Tu rey está en jaque.' : 'Tu turno.')}`)
      setState('ready')
    }).catch((reason: unknown) => {
      if (active) { setState('error'); setError(reason instanceof Error ? reason.message : 'No se pudo obtener la respuesta del motor.') }
    })
    // Generation/unmount cancels application of stale results. The client is disposed by the boot effect.
    return () => { active = false }
  }, [game, moves, result, generation, engineAvailable])

  function persist(updated: string[]) {
    setStorageState(saveBrowserComputerGame(updated) ? 'saved' : 'unavailable')
  }

  function commitMoves(updated: string[]) {
    // Save synchronously at the move boundary, including before a black reply starts.
    // Never save from a render initializer or mount effect: invalid/unknown records stay intact.
    persist(updated)
    movesRef.current = updated
    setMoves(updated)
    setRestored(false)
  }

  function applyMove(from: string, to: string, chosen?: PromotionPiece): boolean {
    if (movesRef.current !== moves || state !== 'ready' || game.turn() !== 'w' || result || recoveryBlocked) return false
    const candidates = legalMoves.filter((move) => move.from === from && move.to === to)
    if (!candidates.length) { setSelected(null); setFeedback('Esa jugada no es legal. Elige una pieza blanca y una casilla legal.'); return false }
    const choices = candidates.flatMap((move) => move.promotion ? [move.promotion as PromotionPiece] : [])
    if (choices.length && !chosen) {
      setPromotion({ from, to, choices })
      setSelected(null)
      return true
    }
    if (chosen && !choices.includes(chosen)) return false
    const move = candidates.find((candidate) => candidate.promotion === chosen)
    if (!move) return false
    const updated = [...moves, `${from}${to}${chosen ?? ''}`]
    commitMoves(updated)
    setPromotion(null)
    setSelected(null)
    setKeyboardMove('')
    setFeedback(`Blancas: ${from} → ${to} (${move.san}).`)
    return true
  }

  function clickSquare(square: string) {
    if (!canPlay) return
    const piece = game.get(square as Square)
    if (piece?.color === 'w') { setSelected(square as Square); return }
    if (selected) applyMove(selected, square)
    else setFeedback('Primero elige una pieza blanca.')
  }

  function restart() {
    engine.current?.dispose()
    const empty: string[] = []
    commitMoves(empty)
    setRecoveryBlocked(false)
    setPromotion(null)
    setSelected(null)
    setKeyboardMove('')
    setFeedback('Nueva partida. Juegas con blancas.')
    setState('loading')
    setGeneration((value) => value + 1)
  }

  function retry() { setState('loading'); setGeneration((value) => value + 1) }

  function retryRestore() {
    if (!recoveryBlocked) return
    const recovered = loadBrowserComputerGame()
    setStorageState(recovered.storageState)
    if (recovered.storageState === 'invalid' || recovered.storageState === 'unavailable') return
    movesRef.current = recovered.moves
    setMoves(recovered.moves)
    setRestored(recovered.moves.length > 0)
    setState('loading')
    setRecoveryBlocked(false)
    setGeneration((value) => value + 1)
  }

  return {
    game, moves, state, error, feedback, result, canPlay, selected, keyboardMove, promotion,
    storageState, restored, recoveryBlocked,
    retryRestore,
    retrySave: () => { if (!recoveryBlocked) persist(movesRef.current) },
    moveOptions: canPlay ? moveOptions : [],
    setKeyboardMove, applyMove, clickSquare, restart, retry,
    choosePromotion: (piece: PromotionPiece) => promotion && applyMove(promotion.from, promotion.to, piece),
    cancelPromotion: () => { setPromotion(null); setKeyboardMove(''); setFeedback('Promoción cancelada. El peón sigue en su casilla.'); },
  }
}
