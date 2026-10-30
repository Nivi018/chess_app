import { ArrowRight, CircleHelp, ChevronDown } from 'lucide-react'
import { Chessboard } from 'react-chessboard'
import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import { SelectField } from '../../../components/ui/select'
import type { ComponentProps, FormEventHandler } from 'react'
import type { LessonDefinition } from '../../../content/lessons'
import { MoveRoute } from './move-route'
import { Chess } from 'chess.js'

type BoardOptions = NonNullable<ComponentProps<typeof Chessboard>['options']>

type BoardExerciseProps = {
  lesson: LessonDefinition
  boardOptions: BoardOptions
  hintVisible: boolean
  keyboardDestination: string
  onHintToggle: () => void
  onKeyboardDestinationChange: (value: string) => void
  onKeyboardSubmit: FormEventHandler<HTMLFormElement>
  completed: boolean
  routeVisible: boolean
}

export function BoardExercise({
  lesson,
  boardOptions,
  hintVisible,
  keyboardDestination,
  onHintToggle,
  onKeyboardDestinationChange,
  onKeyboardSubmit,
  completed,
  routeVisible,
}: BoardExerciseProps) {
  const destinations = new Chess(lesson.startFen).moves({ square: lesson.targetFrom, verbose: true })
    .map((move) => ({ label: move.to, value: move.to }))
  return (
    <section className="min-w-0" aria-labelledby="board-heading">
      <Panel className="p-[clamp(16px,2vw,23px)] max-mobile:p-[14px] max-[390px]:p-[10px]">
        <div className="mb-4 flex items-start justify-between gap-4 max-tablet:block max-mobile:mb-[11px] max-mobile:flex max-mobile:gap-[7px]">
          <div>
            <h2 id="board-heading" className="text-base font-bold tracking-[-.02em] text-ink max-mobile:text-sm">
              Mira el tablero
            </h2>
            <p className="mt-[5px] max-w-[45ch] text-[13px] leading-[1.45] text-muted max-mobile:max-w-[38ch] max-mobile:text-[11px]">
              Las letras y los números te ayudan a encontrar cada casilla.
            </p>
          </div>
          <span className="flex items-center gap-[7px] whitespace-nowrap pt-0.5 text-xs text-[#415c56] max-tablet:mt-[9px] max-mobile:mt-0 max-mobile:self-center max-mobile:text-[10px] max-[390px]:max-w-20 max-[390px]:whitespace-normal">
            <span className="size-2 rounded-full border border-[#8b6c06] bg-signal max-mobile:size-[7px]" aria-hidden="true" />
            Juegan blancas
          </span>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-square w-full overflow-hidden rounded-board border border-[#a8bcb2]" role="group" aria-label={`Tablero de ajedrez. Mueve ${lesson.pieceName} desde ${lesson.targetFrom}.`}>
            <Chessboard options={boardOptions} />
            {routeVisible && <MoveRoute from={lesson.targetFrom} to={lesson.targetTo} />}
          </div>
        </div>

        <div className="mt-3 flex min-h-[54px] items-center gap-[10px] max-tablet:flex-wrap max-tablet:py-[5px] max-mobile:mt-[7px] max-mobile:items-start max-mobile:gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-signal text-ink max-mobile:size-[25px]" aria-hidden="true">
            <ArrowRight className="size-[17px] stroke-[2.2] max-mobile:size-[15px]" />
          </span>
          <p className="min-w-0 flex-1 text-[13px] text-[#425b55] max-mobile:pt-[3px] max-mobile:text-[11px]">
            Arrastra {lesson.pieceName} desde <strong className="text-ink">{lesson.targetFrom}</strong>, o toca la pieza y luego elige su destino.
          </p>
          <Button
            variant="ghost"
            onClick={onHintToggle}
            aria-expanded={hintVisible}
            className="shrink-0 py-2 pl-2 max-tablet:ml-[35px] max-mobile:ml-[31px] max-mobile:py-[5px] max-mobile:text-[11px]"
          >
            {hintVisible ? 'Ocultar pista' : 'Necesito una pista'}
            <ChevronDown className={`size-[15px] transition-transform duration-200 ease-out ${hintVisible ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
        </div>

        {hintVisible && (
          <p className="mb-3 ml-[38px] flex items-start gap-2 text-[13px] leading-[1.5] text-[#3f5c54] max-mobile:ml-[31px] max-mobile:text-xs" role="note">
            <CircleHelp className="mt-px size-4 shrink-0 text-[#315f57]" aria-hidden="true" />
            {lesson.hint}
          </p>
        )}

        <form className="mt-2 border-t border-[#d5dfda] pt-[14px] max-mobile:mt-1 max-mobile:pt-[11px]" onSubmit={onKeyboardSubmit}>
          <div className="flex items-end gap-[9px] max-[390px]:gap-[6px]">
            <SelectField
              id={`${lesson.id}-destination`}
              label="¿Prefieres elegir la casilla?"
              placeholder="Elige un destino"
              value={keyboardDestination}
              options={destinations}
              onValueChange={onKeyboardDestinationChange}
              disabled={completed}
              className="flex-1"
            />
            <Button
              variant="signal"
              type="submit"
              disabled={completed}
              className="max-[390px]:min-w-[92px] max-[390px]:px-[9px]"
            >
              Comprobar
            </Button>
          </div>
        </form>
      </Panel>
    </section>
  )
}
