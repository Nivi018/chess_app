import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import { SelectField } from '../../../components/ui/select'
import { AppHeader } from '../../lesson/components/app-header'
import { LessonNavigation } from '../../lesson/components/lesson-navigation'
import { PromotionPicker } from '../../lesson/components/promotion-picker'
import { LazyProgressDashboard } from '../../academy/components/lazy-progress-dashboard'
import type { AcademyProgress, ActivityTarget } from '../../../domain/academy-progress'
import { engineAssets } from '../engine/stockfish-client'
import { useComputerGame } from '../hooks/use-computer-game'

type BoardOptions = NonNullable<ComponentProps<typeof Chessboard>['options']>
type ComputerPageProps = {
  progress: AcademyProgress
  storageUnavailable: boolean
  onOpenActivity: (target: ActivityTarget) => void
  onShowLessons: () => void
  onShowReviews: () => void
  onShowTactics: () => void
}

export function ComputerPage(props: ComputerPageProps) {
  const session = useComputerGame()
  const [showProgress, setShowProgress] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const boardHeading = useRef<HTMLHeadingElement>(null)
  const restartConfirmation = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const previousPromotion = useRef(session.promotion)
  useEffect(() => { if (!showProgress) heading.current?.focus({ preventScroll: true }) }, [showProgress])
  useEffect(() => { if (confirmRestart) restartConfirmation.current?.querySelector('button')?.focus() }, [confirmRestart])
  useEffect(() => {
    if (previousPromotion.current && !session.promotion) boardHeading.current?.focus({ preventScroll: true })
    previousPromotion.current = session.promotion
  }, [session.promotion])
  const history = session.game.history({ verbose: true })
  const lastMove = history.at(-1)
  const squareStyles: Record<string, CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { boxShadow: 'inset 0 0 0 2px #147b72' }
    squareStyles[lastMove.to] = { boxShadow: 'inset 0 0 0 3px #147b72' }
  }
  if (session.selected) squareStyles[session.selected] = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
  const boardOptions: BoardOptions = {
    id: 'computer-game', position: session.game.fen(), boardOrientation: 'white', showNotation: true,
    allowDrawingArrows: false, allowDragOffBoard: false, animationDurationInMs: 180,
    canDragPiece: ({ square }) => Boolean(session.canPlay && square && session.game.get(square as Square)?.color === 'w'),
    onPieceDrop: ({ sourceSquare, targetSquare }) => Boolean(session.canPlay && targetSquare && session.applyMove(sourceSquare, targetSquare)),
    onSquareClick: ({ square }) => session.clickSquare(square),
    squareStyles,
    darkSquareStyle: { backgroundColor: '#b9cdc2' }, lightSquareStyle: { backgroundColor: '#edf2ec' },
    lightSquareNotationStyle: { color: '#526c65', fontWeight: 700 },
    darkSquareNotationStyle: { color: '#284d45', fontWeight: 700 },
    alphaNotationStyle: { fontSize: '12px', fontWeight: 700, bottom: 3, right: 5 },
    numericNotationStyle: { fontSize: '12px', fontWeight: 700, top: 3, left: 5 },
  }
  const status = session.result ?? (session.recoveryBlocked ? 'Recupera la partida guardada o empieza otra con «Nueva partida».' : session.state === 'loading' ? 'Cargando Stockfish…' : session.state === 'error' ? 'El motor no está disponible.' : session.state === 'thinking' || session.game.turn() === 'b' ? 'El ordenador está pensando…' : session.game.isCheck() ? 'Tu turno: tu rey está en jaque.' : 'Tu turno. Juegan blancas.')

  return <div className="min-h-screen bg-ground font-sans text-ink">
    <AppHeader storageState={props.storageUnavailable ? 'unavailable' : 'ready'} />
    <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1600px] grid-cols-[228px_minmax(0,1fr)] max-tablet:grid-cols-[190px_minmax(0,1fr)] max-mobile:flex max-mobile:flex-col">
      <LessonNavigation completedIds={[]} lessons={[]} activeId="computer" onSelect={() => {}} progressRef={navRef}
        computerMode progressActive={showProgress} onLessonClick={() => setShowProgress(false)} onProgressClick={() => setShowProgress(true)}
        onSwitchMode={props.onShowLessons} onSwitchReview={props.onShowReviews} onSwitchTactics={props.onShowTactics} />
      <main id="lesson" className="min-w-0 px-[clamp(28px,4vw,58px)] pb-8 pt-10 max-tablet:px-[26px] max-mobile:px-4 max-mobile:pt-6 max-[390px]:px-3">
        <div className={showProgress ? 'hidden' : ''}>
          <div className="mx-auto mb-7 max-w-[1240px]">
            <h1 ref={heading} tabIndex={-1} className="text-[clamp(28px,3vw,38px)] font-bold leading-tight tracking-[-.035em] outline-none">Jugar contra el ordenador</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">Tú llevas las blancas. Stockfish juega con negras. Sin reloj y a tu ritmo.</p>
            {session.storageState === 'invalid' ? <p role="alert" className="mt-3 max-w-[70ch] rounded-control bg-error-bg p-3 text-sm leading-relaxed text-error-ink">No se pudo recuperar la partida guardada: su registro no es compatible o está dañado. No lo hemos sobrescrito. Usa «Nueva partida» para descartarlo y empezar otra.</p>
              : session.storageState === 'unavailable' && session.recoveryBlocked ? <div role="alert" className="mt-3 max-w-[70ch] rounded-control bg-error-bg p-3 text-sm leading-relaxed text-error-ink">
                <p>No se pudo leer la partida guardada en este navegador. No hemos sobrescrito nada. Reintenta recuperarla o usa «Nueva partida» para descartarla.</p>
                <Button variant="ghost" className="mt-2" onClick={session.retryRestore}>Reintentar recuperación</Button>
              </div>
              : session.storageState === 'unavailable' ? <div role="alert" className="mt-3 max-w-[70ch] rounded-control bg-error-bg p-3 text-sm leading-relaxed text-error-ink">
                <p>No se pudo leer o guardar la partida en este navegador. Puedes seguir jugando, pero si sales de esta sección o recargas podrías perder los cambios y volver a la última partida guardada.</p>
                <Button variant="ghost" className="mt-2" onClick={session.retrySave}>Reintentar guardado</Button>
              </div>
              : <p role="status" className="mt-3 text-sm leading-relaxed text-ink-soft">{session.restored ? 'Partida recuperada en este dispositivo. Se han restaurado el turno y el historial.' : session.storageState === 'saved' ? 'Partida guardada en este dispositivo.' : 'Guardado automático después de cada jugada. Podrás retomarla aquí al volver.'}</p>}
          </div>
          <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)_minmax(280px,330px)] items-start gap-7 max-tablet:grid-cols-[minmax(0,1fr)_280px] max-tablet:gap-4 max-mobile:grid-cols-1">
            <Panel className="p-5 max-mobile:p-3">
              <h2 ref={boardHeading} tabIndex={-1} className="text-base font-bold outline-none">Tu partida</h2>
              <p role="status" aria-live="polite" aria-atomic="true" className="mb-4 mt-2 text-sm leading-relaxed text-ink-soft">{status}</p>
              <div className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-board border border-[#a8bcb2]" role="group" aria-label="Tablero de partida. Juegas con blancas.">
                <Chessboard options={boardOptions} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{session.recoveryBlocked ? 'El tablero está bloqueado hasta recuperar o descartar el registro guardado.' : session.promotion ? 'Elige una pieza para terminar la promoción.' : 'Toca una pieza blanca y después su destino, o arrástrala. También puedes usar el selector.'}</p>
              {session.promotion && <PromotionPicker promotion={session.promotion} onChoose={session.choosePromotion} onCancel={session.cancelPromotion} />}
              <form className="mt-4 flex items-end gap-2 border-t border-line pt-4 max-[390px]:flex-col max-[390px]:items-stretch" onSubmit={(event) => {
                event.preventDefault()
                if (!session.canPlay) return
                const [from, to] = session.keyboardMove.split(':')
                if (from && to) { session.applyMove(from, to); boardHeading.current?.focus({ preventScroll: true }) }
              }}>
                <SelectField id="computer-move" label="Elegir una jugada legal" className="flex-1" placeholder="Selecciona origen y destino" options={session.moveOptions} value={session.keyboardMove} onValueChange={session.setKeyboardMove} disabled={!session.canPlay} />
                <Button type="submit" variant="signal" disabled={!session.canPlay || !session.keyboardMove}>Jugar</Button>
              </form>
              {!session.result && !session.recoveryBlocked && <p className="mt-4 text-sm leading-relaxed text-ink-soft" aria-live="polite">{session.feedback}</p>}
            </Panel>
            <aside aria-label="Controles de la partida" className="min-w-0">
              <Panel className="p-5">
                <h2 className="text-xl font-bold leading-tight">Practica sin prisa</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">Nivel limitado: habilidad 0 y búsqueda de hasta 2 niveles de profundidad. Aun así, Stockfish puede ser un rival difícil; este ajuste no equivale a un ELO.</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">Es una partida libre: no modifica tus lecciones, repasos ni tácticas. Se guarda en este navegador después de cada jugada confirmada, para retomarla al volver o recargar. Una promoción sin confirmar no se guarda.</p>
                {session.state === 'error' && <div role="alert" className="mt-4 rounded-control bg-error-bg p-3 text-sm leading-relaxed text-error-ink">
                  <p>{session.error} Comprueba la conexión y vuelve a intentarlo. La posición sigue aquí.</p>
                  <Button variant="ghost" className="mt-2" onClick={session.retry}>Reintentar motor</Button>
                </div>}
                {confirmRestart ? <div ref={restartConfirmation} className="mt-5 border-y border-line py-4">
                  <p className="text-sm font-bold">{session.recoveryBlocked ? '¿Descartar el registro guardado?' : '¿Empezar otra partida?'}</p>
                  <p className="mt-2 text-sm text-muted">La nueva partida sustituirá a la guardada en este dispositivo.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="signal" onClick={() => { session.restart(); setConfirmRestart(false); boardHeading.current?.focus() }}>Sí, reiniciar</Button>
                    <Button variant="ghost" onClick={() => { setConfirmRestart(false); boardHeading.current?.focus({ preventScroll: true }) }}>{session.recoveryBlocked ? 'Cancelar' : 'Seguir jugando'}</Button>
                  </div>
                </div> : <Button className="mt-5" onClick={() => session.moves.length || session.recoveryBlocked ? setConfirmRestart(true) : session.restart()}>Nueva partida</Button>}
              </Panel>
              <section aria-label="Historial de la partida" className="mt-6 border-t border-line pt-4">
                <h2 className="text-base font-bold">Jugadas realizadas</h2>
                {history.length ? <ol className="mt-3 max-h-72 overflow-auto text-sm leading-relaxed" aria-label="Historial de jugadas">
                  {history.map((move, index) => <li key={`${index}:${move.san}`} className="border-b border-line py-2 tabular-nums">{Math.floor(index / 2) + 1}. {move.color === 'w' ? 'Blancas' : 'Negras'}: {move.from} → {move.to} ({move.san})</li>)}
                </ol> : <p className="mt-2 text-sm leading-relaxed text-muted">{session.recoveryBlocked ? 'No se ha recuperado un historial. Tu registro guardado sigue intacto.' : 'Todavía no hay jugadas. Cuando el motor esté listo, haz tu primer movimiento.'}</p>}
              </section>
            </aside>
          </div>
          <footer className="mx-auto mt-6 max-w-[1240px] border-t border-line pt-4 text-xs leading-relaxed text-muted">
            <p>Motor local: Stockfish.js 19.0.1, variante ligera de un solo hilo. Las jugadas no se envían a un servidor.</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              <a className="underline underline-offset-4" href={`${engineAssets}Copying.txt`}>Licencia GPLv3</a>
              <a className="underline underline-offset-4" href={`${engineAssets}stockfish.js-v19.0.1-source.tar.gz`} download>Código fuente del motor</a>
              <a className="underline underline-offset-4" href={`${engineAssets}nn-61e7af4bb97d.nnue`} download>Red para compilar</a>
              <a className="underline underline-offset-4" href={`${engineAssets}SOURCE.txt`}>Créditos y compilación</a>
            </p>
          </footer>
        </div>
        {showProgress && <LazyProgressDashboard progress={props.progress} storageUnavailable={props.storageUnavailable} onOpen={props.onOpenActivity} onBack={() => setShowProgress(false)} />}
      </main>
    </div>
  </div>
}
