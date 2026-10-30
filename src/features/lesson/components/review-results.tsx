import type { LessonProgress } from '../../../domain/lesson'

export function ReviewResults({ progresses, total }: { progresses: LessonProgress[]; total: number }) {
  const completed = progresses.filter((progress) => progress.completed).length
  const firstTry = progresses.filter((progress) => progress.firstAttemptCorrect === true).length
  const hints = progresses.reduce((sum, progress) => sum + (progress.hintsUsed ?? 0), 0)
  const attempts = progresses.reduce((sum, progress) => sum + progress.attempts, 0)

  return (
    <section aria-labelledby="review-results-heading" className="mx-auto mb-6 max-w-[1240px] border-y border-line py-4">
      <h2 id="review-results-heading" className="text-base font-bold">Tu repaso</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted">
        <div><dt>Ejercicios resueltos</dt><dd className="font-bold tabular-nums text-ink">{completed} / {total}</dd></div>
        <div><dt>Primer intento sin pistas</dt><dd className="font-bold tabular-nums text-ink">{firstTry} / {total}</dd></div>
        <div><dt>Intentos acumulados</dt><dd className="font-bold tabular-nums text-ink">{attempts}</dd></div>
        <div><dt>Pistas consultadas</dt><dd className="font-bold tabular-nums text-ink">{hints}</dd></div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-muted">Los intentos y las pistas se acumulan. Repetir no reemplaza el primer resultado. Este repaso no estima tu ELO.</p>
    </section>
  )
}
