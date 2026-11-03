import { useEffect, useRef, useState, type ComponentProps, type FormEventHandler } from 'react'
import { Chessboard } from 'react-chessboard'
import { ArrowRight, Check, CircleHelp, RotateCcw } from 'lucide-react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { AppHeader } from '../../lesson/components/app-header'
import { LessonNavigation } from '../../lesson/components/lesson-navigation'
import { MoveRoute } from '../../lesson/components/move-route'
import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import { SelectField } from '../../../components/ui/select'
import { LazyProgressDashboard } from './lazy-progress-dashboard'
import { tactics, type TacticDefinition } from '../../../content/tactics'
import type { AcademyProgress, ActivityTarget } from '../../../domain/academy-progress'
import { createInitialProgress, type LessonProgress } from '../../../domain/lesson'
import type { StorageState } from '../../lesson/hooks/use-lesson'
import { useTactic } from '../hooks/use-tactic'

type BoardOptions = NonNullable<ComponentProps<typeof Chessboard>['options']>

export type TacticsPageProps = {
  progress: AcademyProgress
  storageUnavailable: boolean
  initialActivityId?: string
  initialReplay?: boolean
  onProgressChange: (progress: LessonProgress, state: StorageState) => void
  onOpenActivity: (target: ActivityTarget) => void
  onShowLessons: () => void
  onShowReviews: () => void
}

export function TacticsPage(props: TacticsPageProps) {
  const [activeId, setActiveId] = useState(() =>
    tactics.find((tactic) => tactic.id === props.initialActivityId)?.id ?? tactics.find((tactic) => !props.progress[tactic.id]?.completed)?.id ?? tactics[0].id,
  )
  const [showProgress, setShowProgress] = useState(false)
  const tactic = tactics.find((activity) => activity.id === activeId) ?? tactics[0]
  const completedIds = tactics.filter((activity) => props.progress[activity.id]?.completed).map((activity) => activity.id)
  const hasSavedProgress = Object.values(props.progress).some((record) => record.attempts > 0 || (record.hintsUsed ?? 0) > 0)
  const navRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const previousProgress = useRef(showProgress)

  useEffect(() => {
    if (previousProgress.current !== showProgress) {
      mainRef.current?.querySelector<HTMLElement>(showProgress ? '[data-progress-heading]' : '[data-tactics-heading]')?.focus({ preventScroll: true })
      mainRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
    }
    previousProgress.current = showProgress
  }, [showProgress])

  return (
    <div className="min-h-screen bg-ground font-sans text-ink">
      <AppHeader storageState={props.storageUnavailable ? 'unavailable' : hasSavedProgress ? 'saved' : 'ready'} />
      <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1600px] grid-cols-[228px_minmax(0,1fr)] max-tablet:grid-cols-[190px_minmax(0,1fr)] max-mobile:flex max-mobile:flex-col max-mobile:min-h-[calc(100vh-64px)]">
        <LessonNavigation
          completedIds={completedIds}
          lessons={tactics}
          activeId={tactic.id}
          reviewMode={false}
          tacticsMode
          onSwitchMode={props.onShowLessons}
          onSwitchReview={props.onShowReviews}
          progressActive={showProgress}
          onSelect={(id) => { setActiveId(id); setShowProgress(false) }}
          progressRef={navRef}
          onLessonClick={() => showProgress ? setShowProgress(false) : mainRef.current?.scrollIntoView({ behavior: 'smooth' })}
          onProgressClick={() => setShowProgress((current) => !current)}
        />

        <main ref={mainRef} id="lesson" className="min-w-0 px-[clamp(28px,4vw,58px)] pb-[30px] pt-10 max-wide:pt-12 max-tablet:px-[26px] max-mobile:px-4 max-mobile:pb-[22px] max-mobile:pt-[25px] max-[390px]:px-3">
          <div className={showProgress ? 'hidden' : ''}>
            <TacticSession
              key={`${tactic.id}:${props.initialActivityId === tactic.id && props.initialReplay ? 'replay' : 'normal'}`}
              tactic={tactic}
              progress={props.progress[tactic.id] ?? createInitialProgress(tactic.id)}
              initialReplay={props.initialActivityId === tactic.id && Boolean(props.initialReplay)}
              index={tactics.findIndex((item) => item.id === tactic.id)}
              allCompleted={completedIds.length === tactics.length}
              storageUnavailable={props.storageUnavailable}
              onProgressChange={props.onProgressChange}
              onContinue={() => {
                const next = tactics[tactics.findIndex((item) => item.id === tactic.id) + 1]
                if (next) setActiveId(next.id)
              }}
            />
          </div>
          {showProgress && <LazyProgressDashboard progress={props.progress} storageUnavailable={props.storageUnavailable} onOpen={props.onOpenActivity} onBack={() => setShowProgress(false)} />}
        </main>
      </div>
    </div>
  )
}

function TacticSession({ tactic, progress, initialReplay, index, allCompleted, storageUnavailable, onProgressChange, onContinue }: {
  tactic: TacticDefinition
  progress: LessonProgress
  initialReplay: boolean
  index: number
  allCompleted: boolean
  storageUnavailable: boolean
  onProgressChange: TacticsPageProps['onProgressChange']
  onContinue: () => void
}) {
  const session = useTactic(tactic, progress, onProgressChange, initialReplay)
  const replyRef = useRef<HTMLElement>(null)
  const boardHeadingRef = useRef<HTMLHeadingElement>(null)
  const coachHeadingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(session.stepIndex)
  useEffect(() => {
    if (previousStep.current === session.stepIndex) return
    if (session.waitingForReply) replyRef.current?.querySelector('button')?.focus()
    else if (session.completed) coachHeadingRef.current?.focus({ preventScroll: true })
    else boardHeadingRef.current?.focus({ preventScroll: true })
    previousStep.current = session.stepIndex
  }, [session.stepIndex, session.waitingForReply, session.completed])
  const destinations = session.moveOptions
  const boardOptions: BoardOptions = {
    id: tactic.id,
    position: session.position,
    boardOrientation: 'white',
    showNotation: true,
    allowDrawingArrows: false,
    allowDragOffBoard: false,
    animationDurationInMs: 220,
    boardStyle: { width: '100%', borderRadius: '4px', overflow: 'hidden' },
    lightSquareStyle: { backgroundColor: '#eef3ee', color: '#4f6661' },
    darkSquareStyle: { backgroundColor: '#b9cdc2', color: '#173238' },
    lightSquareNotationStyle: { color: '#526c65', fontWeight: 700 },
    darkSquareNotationStyle: { color: '#284d45', fontWeight: 700 },
    alphaNotationStyle: { fontSize: '12px', fontWeight: 700, bottom: 3, right: 5 },
    numericNotationStyle: { fontSize: '12px', fontWeight: 700, top: 3, left: 5 },
    squareStyles: session.squareStyles,
    canDragPiece: ({ square }) => Boolean(session.canPlay && square && new Chess(session.position).get(square as Square)?.color === new Chess(session.position).turn()),
    onSquareClick: ({ square }) => session.onSquareClick(square),
    onPieceDrop: session.onPieceDrop,
  }
  const submit: FormEventHandler<HTMLFormElement> = (event) => session.onKeyboardSubmit(event)
  const learnerMoves = tactic.steps.filter((step) => step.actor === 'learner')
  const turnIndex = tactic.steps.slice(0, session.stepIndex).filter((step) => step.actor === 'learner').length

  return (
    <>
      <div className="mx-auto mb-7 flex max-w-[1240px] items-end justify-between gap-6 max-mobile:mb-[18px] max-mobile:items-start max-mobile:gap-[10px]">
        <div>
          <h1 data-tactics-heading tabIndex={-1} className="m-0 text-[clamp(28px,3vw,38px)] leading-[1.12] font-bold tracking-[-.035em] outline-none">{tactic.title}</h1>
          <p className="mt-[10px] text-[15px] text-muted max-mobile:text-[13px]">{tactic.theme} · Combinación guiada</p>
        </div>
        <span className="shrink-0 pb-1 text-[13px] font-bold max-mobile:text-[11px]">Táctica {index + 1} <span className="font-medium text-muted">de {tactics.length}</span></span>
      </div>

      {storageUnavailable && <p role="status" className="mx-auto mb-5 max-w-[1240px] rounded-control border border-error-ink bg-error-bg p-3 text-sm text-error-ink">No se pudo guardar; los cambios pueden perderse al recargar.</p>}

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)_minmax(280px,330px)] items-start gap-[26px] max-wide:gap-[30px] max-tablet:grid-cols-[minmax(0,1fr)_290px] max-tablet:gap-[18px] max-mobile:grid-cols-1 max-mobile:gap-[14px]">
        <section aria-labelledby="tactic-board-heading" className="min-w-0">
          <Panel className="p-[clamp(16px,2vw,23px)] max-mobile:p-[14px]">
            <div className="mb-4 flex items-start justify-between gap-4 max-mobile:mb-3">
              <div>
                <h2 ref={boardHeadingRef} tabIndex={-1} id="tactic-board-heading" className="text-base font-bold outline-none">Encuentra la combinación</h2>
                <p className="mt-1 max-w-[55ch] text-[13px] leading-relaxed text-muted">{session.completed ? 'La línea completa queda visible en el tablero.' : session.currentInstruction}</p>
              </div>
              <span className="shrink-0 pt-1 text-xs text-ink-soft">{new Chess(session.position).turn() === 'w' ? 'Juegan blancas' : 'Juegan negras'}</span>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative aspect-square w-full overflow-hidden rounded-board border border-[#a8bcb2]" role="group" aria-label={`Tablero de táctica. ${session.completed ? 'Combinación completada.' : session.currentInstruction}`}>
                <Chessboard options={boardOptions} />
                {session.routeVisible && learnerMoves.map((move, moveIndex) => <MoveRoute key={`${move.from}-${move.to}-${moveIndex}`} from={move.from} to={move.to} />)}
              </div>
            </div>

            {session.waitingForReply && <section ref={replyRef} aria-label="Turno rival preparado" className="mt-4 border-y border-line bg-sage/40 px-3 py-4">
              <h3 className="text-sm font-bold">Observa antes de continuar</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Tu jugada ya está en el tablero. Cuando quieras, muestra la respuesta preparada del rival.</p>
              <Button className="mt-3 max-w-fit" onClick={session.showPreparedReply}>Ver respuesta rival</Button>
            </section>}
            {session.lastReply && <section aria-label="Respuesta rival mostrada" className="mt-4 border-y border-line py-3 text-sm leading-relaxed">
              <h3 className="font-bold">Respuesta preparada: {session.lastReply.from} → {session.lastReply.to} ({session.lastReply.san})</h3>
              <p className="mt-1 text-muted">{session.lastReply.explanation}</p>
            </section>}

            <div className="mt-3 flex min-h-12 items-center gap-2 max-mobile:flex-wrap">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-signal text-ink" aria-hidden="true"><ArrowRight size={16} /></span>
              <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-soft max-mobile:text-xs">{session.completed ? 'Combinación completada.' : session.waitingForReply ? 'El tablero espera la respuesta rival preparada.' : `Jugada ${Math.min(turnIndex + 1, learnerMoves.length)} de ${learnerMoves.length}. Toca una pieza y su destino, o usa el selector.`}</p>
              {session.canPlay && <Button variant="ghost" aria-expanded={session.hintVisible} onClick={session.toggleHint} className="shrink-0">{session.hintVisible ? 'Ocultar pista' : 'Necesito una pista'}</Button>}
            </div>
            {session.hintVisible && session.canPlay && <p role="note" className="mb-3 ml-9 flex gap-2 text-[13px] leading-relaxed text-ink-soft"><CircleHelp size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{session.currentHint}</p>}

            {session.lineSan.length > 0 && <ol aria-label="Jugadas realizadas" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-3 text-sm tabular-nums text-ink-soft">{session.lineSan.map((san, moveIndex) => <li key={`${moveIndex}-${san}`}>{Math.floor(moveIndex / 2) + 1}{moveIndex % 2 === 0 ? '. ' : '… '}{san}</li>)}</ol>}

            <form onSubmit={submit} className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-line pt-3 max-[390px]:grid-cols-1">
              <SelectField id={`${tactic.id}-move`} label="Elegir una jugada legal" placeholder="Selecciona una jugada" value={session.keyboardMove} options={destinations} onValueChange={session.onKeyboardMoveChange} disabled={!session.canPlay} />
              <Button variant="signal" type="submit" disabled={!session.canPlay}>Comprobar</Button>
            </form>
          </Panel>
        </section>

        <aside aria-label="Explicación de la táctica">
          <Panel className="p-[25px_24px_19px] max-mobile:p-[19px_18px_16px]">
            <h2 ref={coachHeadingRef} tabIndex={-1} className="text-[22px] leading-[1.2] font-bold tracking-[-.035em] outline-none max-mobile:text-xl">{session.completed ? 'Así funciona la combinación' : 'Resuelve antes de ver la explicación'}</h2>
            <p className="my-3 mb-5 text-sm leading-[1.6] text-[#465f59] max-mobile:text-[13px]">{session.completed ? tactic.explanation : 'Piensa qué piezas cooperan y qué amenaza crea cada jugada. La explicación completa aparecerá al terminar la línea.'}</p>
            <div className="rounded-control border border-[#d5e1d9] bg-[#edf3ee] p-[17px] max-mobile:p-[14px]">
              <p className="text-sm font-bold text-[#285d53]">{session.completed ? '¡Línea completada!' : session.waitingForReply ? 'Turno rival preparado' : 'Tu turno'}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#213f3b]">{session.completed ? 'Revisa las jugadas realizadas y la idea táctica.' : session.currentInstruction}</p>
            </div>
            {!session.completed && tactic.steps.some((step) => step.actor === 'prepared-reply') && <p className="mt-4 text-xs leading-relaxed text-muted">Entre tus jugadas se mostrará una respuesta rival preparada para el ejercicio. No es una partida contra Stockfish ni una evaluación de todas las defensas.</p>}
            <div role="status" aria-live="polite" aria-atomic="true" className={`mt-4 rounded-control px-3 py-3 text-xs leading-relaxed ${session.feedback.tone === 'success' ? 'bg-success-bg text-success-ink' : session.feedback.tone === 'try-again' ? 'bg-error-bg text-error-ink' : 'bg-[#eff4f1] text-[#35574f]'}`}>
              {session.feedback.tone === 'success' && <Check size={15} className="mr-1 inline" aria-hidden="true" />}{session.feedback.message}
            </div>
            {session.completed ? (
              <div className="mt-3 grid gap-2">
                <Button variant="primary" onClick={session.replayTactic}><RotateCcw size={16} aria-hidden="true" /> Repetir la táctica</Button>
                {index < tactics.length - 1 && <Button variant="nav" onClick={onContinue}>Continuar: {tactics[index + 1].title}</Button>}
              </div>
            ) : <p className="mt-4 text-xs leading-relaxed text-muted">Intentos: <strong className="tabular-nums text-ink">{progress.attempts}</strong> · Pistas: <strong className="tabular-nums text-ink">{progress.hintsUsed ?? 0}</strong></p>}
          </Panel>
        </aside>
      </div>

      {session.completed && index === tactics.length - 1 && <p className="mx-auto mt-5 max-w-[1240px] text-sm text-success-ink">{allCompleted ? 'Has completado las tácticas disponibles. Puedes repetirlas o volver a las lecciones.' : 'Táctica resuelta. Puedes elegir otra pendiente en Mis tácticas.'}</p>}
      <footer className="mx-auto mt-6 flex max-w-[1240px] justify-between gap-3 border-t border-line pt-4 text-[11px] text-muted max-mobile:flex-col"><span>Jugadas validadas con las reglas del ajedrez.</span><span>Tu avance se guarda en este dispositivo.</span></footer>
    </>
  )
}
