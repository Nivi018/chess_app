import { Button } from '../../../components/ui/button'
import { ProgressBar } from '../../../components/ui/progress-bar'
import { lessons } from '../../../content/lessons'
import { reviewExercises } from '../../../content/review-exercises'
import type { LessonDefinition } from '../../../content/lesson-definition'
import { recommendActivity, summarizeProgress, type AcademyProgress, type ActivityTarget } from '../../../domain/academy-progress'

function count(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
}

type ProgressDashboardProps = {
  progress: AcademyProgress
  storageUnavailable: boolean
  onOpen: (target: ActivityTarget) => void
  onBack: () => void
}

export function ProgressDashboard({ progress, storageUnavailable, onOpen, onBack }: ProgressDashboardProps) {
  const lessonSummary = summarizeProgress(lessons, progress)
  const reviewSummary = summarizeProgress(reviewExercises, progress)
  const recommendation = recommendActivity(lessons, reviewExercises, progress)

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 tabIndex={-1} className="text-[clamp(28px,3vw,38px)] font-bold leading-tight tracking-[-.035em] outline-none">Mi avance</h1>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted">Tus lecciones y repasos en este navegador. No se envían datos a un servidor.</p>
        </div>
        <Button variant="ghost" onClick={onBack}>Volver a la actividad</Button>
      </div>

      {storageUnavailable && (
        <p role="status" className="mt-5 rounded-control border border-error-ink bg-error-bg p-4 text-sm leading-relaxed text-error-ink">
          No se pudo guardar el progreso en este navegador. Puedes seguir practicando durante esta sesión, pero al recargar podrías perder los últimos resultados.
        </p>
      )}

      {recommendation && (
        <section aria-labelledby="next-step-heading" className="my-7 border-y border-line bg-sage/40 px-5 py-5 max-mobile:px-4">
          <h2 id="next-step-heading" className="text-lg font-bold">Tu siguiente paso</h2>
          <p className="mt-2 text-base font-bold">{recommendation.title}</p>
          <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted">{recommendation.reason}</p>
          <Button className="mt-4 max-w-fit" onClick={() => onOpen(recommendation.target)}>
            {recommendation.target.replay ? 'Volver a practicar' : 'Continuar aprendiendo'}
          </Button>
        </section>
      )}

      <section aria-label="Resumen de actividades" className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-line pb-6 max-mobile:grid-cols-1">
        <div>
          <h2 className="text-lg font-bold">Lecciones completadas <span className="ml-2 whitespace-nowrap text-base tabular-nums text-muted">{lessonSummary.completed} / {lessonSummary.total}</span></h2>
          <ProgressBar label="Lecciones completadas en Mi avance" value={lessonSummary.completed / lessonSummary.total * 100} className="mt-3" />
          <p className="mt-3 text-sm tabular-nums text-muted">{count(lessonSummary.total - lessonSummary.completed, 'pendiente', 'pendientes')} · {count(lessonSummary.attempts, 'intento acumulado', 'intentos acumulados')}</p>
        </div>
        <div>
          <h2 className="text-lg font-bold">Repasos resueltos <span className="ml-2 whitespace-nowrap text-base tabular-nums text-muted">{reviewSummary.completed} / {reviewSummary.total}</span></h2>
          <ProgressBar label="Repasos resueltos en Mi avance" value={reviewSummary.completed / reviewSummary.total * 100} className="mt-3" />
          <p className="mt-3 text-sm tabular-nums text-muted">{count(reviewSummary.total - reviewSummary.completed, 'pendiente', 'pendientes')} · {count(reviewSummary.attempts, 'intento', 'intentos')} · {count(reviewSummary.hints, 'pista', 'pistas')}</p>
          <p className="mt-2 text-sm text-muted">{reviewSummary.firstTry} de {reviewSummary.total} al primer intento sin pistas.</p>
          {reviewSummary.unknownFirstResult > 0 && <p className="mt-2 text-sm text-muted">{reviewSummary.unknownFirstResult} {reviewSummary.unknownFirstResult === 1 ? 'repaso completado' : 'repasos completados'} sin dato del primer intento.</p>}
        </div>
      </section>

      <nav aria-label="Listas de avance" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-ink-soft">
        <a className="rounded-control py-2 underline underline-offset-4 hover:text-teal" href="#progress-lessons">Ver lecciones</a>
        <a className="rounded-control py-2 underline underline-offset-4 hover:text-teal" href="#progress-review">Ver repasos</a>
      </nav>

      <div className="mt-8 grid grid-cols-2 items-start gap-8 max-mobile:grid-cols-1">
        <ActivityList title="Tus lecciones" mode="lessons" catalog={lessons} progress={progress} onOpen={onOpen} />
        <ActivityList title="Tus repasos" mode="review" catalog={reviewExercises} progress={progress} onOpen={onOpen} />
      </div>
      <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-muted">Estos resultados describen esta práctica guiada, no tu ELO ni un dominio definitivo. Los intentos y las pistas se acumulan; repetir no reemplaza el primer resultado.</p>
    </div>
  )
}

function ActivityList({ title, mode, catalog, progress, onOpen }: {
  title: string
  mode: ActivityTarget['mode']
  catalog: LessonDefinition[]
  progress: AcademyProgress
  onOpen: (target: ActivityTarget) => void
}) {
  return (
    <section aria-label={title} id={`progress-${mode}`} className="scroll-mt-5">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <ol className="divide-y divide-line border-y border-line">
        {catalog.map((activity, index) => {
          const record = progress[activity.id]
          const completed = record?.completed ?? false
          const started = (record?.attempts ?? 0) > 0 || (record?.hintsUsed ?? 0) > 0
          return (
            <li key={activity.id} className="py-3">
              <Button variant="nav" className="min-h-11 px-0 hover:bg-sage/50" onClick={() => onOpen({ mode, activityId: activity.id, replay: completed })} aria-label={`${completed ? 'Repetir' : 'Abrir'}: ${activity.title}`}>
                <span className="min-w-0 flex-1 text-sm">{index + 1}. {activity.title}</span>
                <span className={`shrink-0 text-xs ${completed ? 'text-success-ink' : 'text-muted'}`}>{completed ? 'Repetir' : 'Abrir'}</span>
              </Button>
              <p className="mt-1 text-xs leading-relaxed tabular-nums text-muted">
                {completed ? 'Completado' : started ? 'En práctica' : 'Pendiente'} · {count(record?.attempts ?? 0, 'intento', 'intentos')} · {count(record?.hintsUsed ?? 0, 'pista', 'pistas')}
              </p>
              {mode === 'review' && completed && <p className="mt-1 text-xs leading-relaxed text-muted">{record?.firstAttemptCorrect === true ? 'Primer intento sin pistas' : record?.firstAttemptCorrect === false ? 'Primer intento con ayuda o error' : 'Primer intento sin registrar'}</p>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
