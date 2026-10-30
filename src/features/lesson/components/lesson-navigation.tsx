import type { RefObject } from 'react'
import { BookOpenText, Check, CircleHelp, Route } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ProgressBar } from '../../../components/ui/progress-bar'

type LessonNavigationProps = {
  completed: boolean
  progressRef: RefObject<HTMLDivElement | null>
  onLessonClick: () => void
  onProgressClick: () => void
}

export function LessonNavigation({ completed, progressRef, onLessonClick, onProgressClick }: LessonNavigationProps) {
  return (
    <aside
      className="flex flex-col border-r border-[#ccd8d2] bg-[#e4ece7] px-[18px] pb-7 pt-9 max-tablet:px-[14px] max-mobile:grid max-mobile:grid-cols-2 max-mobile:gap-[7px] max-mobile:border-r-0 max-mobile:border-b max-mobile:border-[#c6d4cd] max-mobile:px-4 max-mobile:pb-[10px] max-mobile:pt-3"
      aria-label="Navegación de la academia"
    >
      <div className="mb-[13px] ml-[10px] text-[11px] font-bold tracking-[.1em] text-[#4d6560] max-mobile:hidden">
        TU ESPACIO
      </div>
      <Button variant="navActive" onClick={onLessonClick} className="max-mobile:min-h-[41px] max-mobile:justify-center max-mobile:px-2 max-mobile:text-xs">
        <BookOpenText className="size-[18px] shrink-0" aria-hidden="true" />
        <span>Mi primera lección</span>
      </Button>
      <Button variant="nav" onClick={onProgressClick} className="max-mobile:min-h-[41px] max-mobile:justify-center max-mobile:px-2 max-mobile:text-xs">
        <Route className="size-[18px] shrink-0" aria-hidden="true" />
        <span>Mi avance</span>
        {completed && <Check className="ml-auto size-4 text-success-ink max-mobile:ml-0" aria-label="Lección completada" />}
      </Button>

      <div ref={progressRef} className="mt-[37px] border-t border-[#c6d4cd] px-[9px] pt-[19px] max-mobile:col-span-full max-mobile:mx-[3px] max-mobile:mt-[5px] max-mobile:border-t max-mobile:pt-[10px]">
        <div className="mb-[15px] text-sm font-bold max-mobile:hidden">Tu recorrido</div>
        <div className="flex justify-between gap-2 text-xs text-[#455e58] max-mobile:text-[11px]">
          <span>Primera lección</span>
          <span className="tabular-nums font-bold text-ink">{completed ? '1 / 1' : '0 / 1'}</span>
        </div>
        <ProgressBar value={completed ? 100 : 0} label="Progreso de la lección" className="mt-[10px] max-mobile:mt-[7px] max-mobile:h-[5px]" />
        <p className="mt-[9px] text-xs text-[#4d6560] max-mobile:hidden">
          {completed ? 'Ya diste tu primer paso.' : 'Una jugada a la vez.'}
        </p>
      </div>

      <div className="mt-auto flex items-start gap-[9px] px-[9px] pt-7 text-xs leading-[1.5] text-[#4d6560] max-mobile:hidden">
        <CircleHelp className="mt-px size-[17px] shrink-0 text-[#315f57]" aria-hidden="true" />
        <span>No necesitas saber nada de ajedrez para empezar.</span>
      </div>
    </aside>
  )
}
