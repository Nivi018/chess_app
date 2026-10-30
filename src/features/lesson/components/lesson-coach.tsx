import { Check, CircleHelp, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import type { LessonProgress } from '../../../domain/lesson'
import type { Feedback } from '../hooks/use-knight-lesson'

type LessonCoachProps = {
  completed: boolean
  progress: LessonProgress
  feedback: Feedback
  replaying: boolean
  onReplay: () => void
}

export function LessonCoach({ completed, progress, feedback, replaying, onReplay }: LessonCoachProps) {
  return (
    <aside aria-label="Instrucciones de la lección">
      <Panel className="p-[25px_24px_19px] max-mobile:p-[19px_18px_16px]">
        <h2 className="text-[22px] leading-[1.2] font-bold tracking-[-.035em] text-ink max-mobile:text-xl">
          Recuerda la forma de L
        </h2>
        <p className="my-3 mb-5 text-sm leading-[1.6] text-[#465f59] max-mobile:my-[9px] max-mobile:mb-[15px] max-mobile:text-[13px]">
          El caballo avanza dos casillas en una dirección y una más hacia un lado. Puede saltar por encima de otras piezas.
        </p>

        <div className="rounded-md border border-[#d5e1d9] bg-[#edf3ee] p-[17px] max-mobile:p-[14px]">
          <div className="flex min-h-[17px] items-center gap-[7px] text-[#285d53]">
            {completed ? <Check className="size-[17px] text-success-ink" aria-hidden="true" /> : null}
            <span className="text-[11px] font-bold tracking-[.08em]">
              {completed ? '¡LO LOGRASTE!' : 'TU TURNO'}
            </span>
          </div>
          <p className="mt-[9px] text-[13px] leading-[1.55] text-[#213f3b] max-mobile:text-xs">
            {completed
              ? 'Fíjate en el recorrido: dos casillas y una más hacia un lado.'
              : 'Desde b1, busca la casilla que queda dos filas hacia delante y una columna a la derecha.'}
          </p>
          {completed && (
            <div className="mt-[14px] flex items-center gap-2 text-[13px] font-bold text-ink">
              <span className="grid h-[30px] w-[34px] place-items-center rounded-[3px] border border-[#8b6c06] bg-signal">b1</span>
              <span aria-hidden="true">→</span>
              <span className="grid h-[30px] w-[34px] place-items-center rounded-[3px] border border-[#8b6c06] bg-signal">c3</span>
              <small className="ml-auto text-[11px] font-medium text-[#4d6560]">Tu primer salto</small>
            </div>
          )}
        </div>

        <div
          className={`mt-[15px] flex min-h-[54px] items-start gap-[9px] rounded-control px-[13px] py-3 max-mobile:mt-3 max-mobile:min-h-12 max-mobile:p-[10px] ${feedback.tone === 'success' ? 'bg-success-bg text-success-ink' : feedback.tone === 'try-again' ? 'bg-error-bg text-error-ink' : 'bg-[#eff4f1] text-[#35574f]'}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback.tone === 'success' ? (
            <Check className="mt-px size-[17px] shrink-0" aria-hidden="true" />
          ) : feedback.tone === 'try-again' ? (
            <RotateCcw className="mt-px size-4 shrink-0" aria-hidden="true" />
          ) : (
            <CircleHelp className="mt-px size-[17px] shrink-0" aria-hidden="true" />
          )}
          <p className="m-0 text-xs leading-[1.5]">{feedback.message}</p>
        </div>

        {completed ? (
          <Button variant="primary" onClick={onReplay} className="mt-[14px]">
            <RotateCcw className="size-4" aria-hidden="true" /> Repetir el ejercicio
          </Button>
        ) : (
          <p className="mx-px mt-[13px] text-xs leading-[1.5] text-[#526963]">
            Haz tu jugada en el tablero. Si no estás seguro, puedes pedir una pista.
          </p>
        )}

        <div className="mt-[18px] flex items-center justify-between border-t border-[#d5dfda] pt-[14px] text-xs text-[#4d6560]">
          <span>Intentos</span>
          <strong className="tabular-nums text-[13px] text-ink">{progress.attempts}</strong>
        </div>
        {replaying && <span className="sr-only">Repitiendo la lección; el progreso completado se conserva.</span>}
      </Panel>
    </aside>
  )
}
