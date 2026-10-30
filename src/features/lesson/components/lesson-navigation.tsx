import type { RefObject } from 'react'
import { BookOpenText, Check, CircleHelp, RotateCcw, Route } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ProgressBar } from '../../../components/ui/progress-bar'
import type { LessonDefinition } from '../../../content/lessons'

type LessonNavigationProps = {
  completedIds: string[]
  lessons: LessonDefinition[]
  activeId: string
  onSelect: (id: string) => void
  progressRef: RefObject<HTMLDivElement | null>
  onLessonClick: () => void
  onProgressClick: () => void
  reviewMode?: boolean
  onSwitchMode?: () => void
  progressActive?: boolean
}

export function LessonNavigation({ completedIds, lessons, activeId, onSelect, progressRef, onLessonClick, onProgressClick, reviewMode = false, onSwitchMode, progressActive = false }: LessonNavigationProps) {
  const completedCount = completedIds.length
  return (
    <aside
      className="flex flex-col border-r border-[#ccd8d2] bg-[#e4ece7] px-[18px] pb-7 pt-9 max-tablet:px-[14px] max-mobile:grid max-mobile:grid-cols-2 max-mobile:gap-[7px] max-mobile:border-r-0 max-mobile:border-b max-mobile:border-[#c6d4cd] max-mobile:px-4 max-mobile:pb-[10px] max-mobile:pt-3"
      aria-label="Navegación de la academia"
    >
      <div className="mb-[13px] ml-[10px] text-[11px] font-bold tracking-[.1em] text-[#4d6560] max-mobile:hidden">
        TU ESPACIO
      </div>
      <Button variant={progressActive ? 'nav' : 'navActive'} aria-current={!progressActive ? 'page' : undefined} onClick={onLessonClick} className="max-mobile:min-h-[41px] max-mobile:justify-center max-mobile:px-2 max-mobile:text-xs">
        <BookOpenText className="size-[18px] shrink-0" aria-hidden="true" />
        <span>{reviewMode ? 'Mis ejercicios' : 'Mis lecciones'}</span>
      </Button>

      <Button variant={progressActive ? 'navActive' : 'nav'} aria-current={progressActive ? 'page' : undefined} onClick={onProgressClick} className="max-mobile:min-h-[41px] max-mobile:justify-center max-mobile:px-2 max-mobile:text-xs">
        <Route className="size-[18px] shrink-0" aria-hidden="true" />
        <span>Mi avance</span>
        {completedCount === lessons.length && <Check className="ml-auto size-4 text-success-ink max-mobile:ml-0" aria-hidden="true" />}
      </Button>

      {onSwitchMode && (
        <Button variant="nav" onClick={onSwitchMode} className="max-mobile:col-span-full max-mobile:justify-center max-mobile:text-xs">
          <RotateCcw size={18} aria-hidden="true" />
          <span>{reviewMode ? 'Volver a las lecciones' : 'Repasar movimientos'}</span>
        </Button>
      )}

      <div ref={progressRef} className={`mt-[37px] border-t border-[#c6d4cd] px-[9px] pt-[19px] max-mobile:col-span-full max-mobile:mx-[3px] max-mobile:mt-[5px] max-mobile:border-t max-mobile:pt-[10px] ${progressActive ? 'max-mobile:hidden' : ''}`}>
        <div className="mb-[15px] text-sm font-bold max-mobile:hidden">Tu recorrido</div>
        <div className="flex justify-between gap-2 text-xs text-[#455e58] max-mobile:text-[11px]">
          <span>{reviewMode ? 'Ejercicios resueltos' : 'Lecciones completadas'}</span>
          <span className="tabular-nums font-bold text-ink">{completedCount} / {lessons.length}</span>
        </div>
        <ProgressBar value={completedCount / lessons.length * 100} label={reviewMode ? 'Progreso del repaso' : 'Progreso del curso'} className="mt-[10px] max-mobile:mt-[7px] max-mobile:h-[5px]" />
        <p className="mt-[9px] text-xs text-[#4d6560] max-mobile:hidden">
          {completedCount ? 'Sigue practicando a tu ritmo.' : 'Una jugada a la vez.'}
        </p>
      </div>

      <nav aria-label={reviewMode ? 'Elegir ejercicio' : 'Elegir lección'} className={`mt-4 grid gap-1 max-mobile:col-span-full ${progressActive ? 'hidden' : ''}`}>
        {lessons.map((lesson, index) => (
          <Button key={lesson.id} variant={lesson.id === activeId ? 'navActive' : 'nav'} onClick={() => onSelect(lesson.id)} aria-current={lesson.id === activeId ? 'page' : undefined}>
            <span className="min-w-0 flex-1 text-xs">{index + 1}. {lesson.title}</span>
            {completedIds.includes(lesson.id) && <Check size={16} aria-label="Completada" className="shrink-0 text-success-ink" />}
          </Button>
        ))}
      </nav>

      <div className="mt-auto flex items-start gap-[9px] px-[9px] pt-7 text-xs leading-[1.5] text-[#4d6560] max-mobile:hidden">
        <CircleHelp className="mt-px size-[17px] shrink-0 text-[#315f57]" aria-hidden="true" />
        <span>No necesitas saber nada de ajedrez para empezar.</span>
      </div>
    </aside>
  )
}
