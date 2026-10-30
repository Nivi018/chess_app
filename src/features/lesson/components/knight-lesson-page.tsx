import { useRef } from 'react'
import { AppHeader } from './app-header'
import { BoardExercise } from './board-exercise'
import { LessonCoach } from './lesson-coach'
import { LessonNavigation } from './lesson-navigation'
import { useKnightLesson } from '../hooks/use-knight-lesson'

export function KnightLessonPage() {
  const lesson = useKnightLesson()
  const lessonRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const completed = lesson.progress.completed && !lesson.replaying

  return (
    <div className="min-h-screen bg-ground font-sans text-ink">
      <AppHeader storageState={lesson.storageState} />

      <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1600px] grid-cols-[228px_minmax(0,1fr)] max-tablet:grid-cols-[190px_minmax(0,1fr)] max-mobile:flex max-mobile:flex-col max-mobile:min-h-[calc(100vh-64px)]">
        <LessonNavigation
          completed={lesson.progress.completed}
          progressRef={progressRef}
          onLessonClick={() => lessonRef.current?.scrollIntoView({ behavior: 'smooth' })}
          onProgressClick={() => progressRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        <main ref={lessonRef} className="min-w-0 px-[clamp(28px,4vw,58px)] pb-[30px] pt-10 max-wide:pt-12 max-tablet:px-[26px] max-mobile:px-4 max-mobile:pb-[22px] max-mobile:pt-[25px] max-[390px]:px-3" id="lesson">
          <div className="mx-auto mb-7 flex max-w-[1240px] items-end justify-between gap-6 max-mobile:mb-[18px] max-mobile:items-start max-mobile:gap-[10px]">
            <div>
              <h1 className="m-0 text-[clamp(28px,3vw,38px)] leading-[1.12] font-bold tracking-[-.045em] text-ink max-mobile:max-w-[15ch] max-mobile:text-[clamp(25px,7vw,32px)]">
                {lesson.lesson.title}
              </h1>
              <p className="mt-[10px] text-[15px] text-muted max-mobile:mt-2 max-mobile:max-w-[43ch] max-mobile:text-[13px]">
                {lesson.lesson.summary}
              </p>
            </div>
            <span className="shrink-0 pb-[3px] text-[13px] font-bold text-ink max-mobile:pt-[5px] max-mobile:text-[11px]">
              Lección 1 <span className="font-medium text-muted">de 1</span>
            </span>
          </div>

          <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)_minmax(280px,330px)] items-start gap-[26px] max-wide:grid-cols-[minmax(0,1fr)_340px] max-wide:gap-[30px] max-tablet:grid-cols-[minmax(0,1fr)_290px] max-tablet:gap-[18px] max-mobile:grid-cols-1 max-mobile:gap-[14px]">
            <BoardExercise
              boardOptions={lesson.boardOptions}
              hintVisible={lesson.hintVisible}
              keyboardDestination={lesson.keyboardDestination}
              onHintToggle={() => lesson.setHintVisible((visible) => !visible)}
              onKeyboardDestinationChange={lesson.handleKeyboardDestinationChange}
              onKeyboardSubmit={lesson.handleKeyboardSubmit}
              completed={lesson.progress.completed && !lesson.replaying}
              routeVisible={lesson.routeVisible}
            />
            <LessonCoach
              completed={completed}
              progress={lesson.progress}
              feedback={lesson.feedback}
              replaying={lesson.replaying}
              onReplay={lesson.replayLesson}
            />
          </div>

          <footer className="mx-auto mt-5 flex max-w-[1240px] justify-between gap-[14px] border-t border-[#d5dfda] pt-[14px] text-[11px] text-[#58706a] max-mobile:mt-[14px] max-mobile:flex-col max-mobile:gap-[5px] max-mobile:text-[10px]">
            <span>Reglas verificadas para que puedas aprender con confianza.</span>
            <span>Tu avance se queda en este dispositivo.</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
