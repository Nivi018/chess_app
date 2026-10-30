import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../providers/prime-provider'
import { Academy } from './academy'
import { reviewExercises } from '../../content/review-exercises'
import { createInitialProgress, loadProgress, recordAttempt, saveProgress } from '../../domain/lesson'

function renderAcademy() {
  return render(<PrimeProvider><Academy /></PrimeProvider>)
}

describe('review experience', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64, toJSON: () => ({}),
    })
  })
  afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

  it('reveals explanations only after success and persists hints before attempting', async () => {
    const user = userEvent.setup()
    const original = recordAttempt(createInitialProgress(), 'correct')
    saveProgress(original, localStorage)
    const { container, unmount } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    const exercise = reviewExercises[0]
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    expect(loadProgress(localStorage, exercise.id).hintsUsed).toBe(1)
    fireEvent.click(container.querySelector(`[data-square="${exercise.targetFrom}"]`)!)
    fireEvent.click(container.querySelector(`[data-square="${exercise.targetTo}"]`)!)
    expect(screen.getByText(exercise.explanation)).toBeTruthy()
    expect(loadProgress(localStorage, exercise.id).firstAttemptCorrect).toBe(false)
    expect(loadProgress(localStorage)).toEqual(original)
    unmount()
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    expect(screen.getByRole('heading', { name: reviewExercises[1].title })).toBeTruthy()
    const results = screen.getByRole('region', { name: 'Tu repaso' })
    expect(within(results).getByText(`1 / ${reviewExercises.length}`)).toBeTruthy()
  })

  it('completes all reviews, preserves first results during replay and returns to lessons', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    for (const [index, exercise] of reviewExercises.entries()) {
      fireEvent.click(container.querySelector(`[data-square="${exercise.targetFrom}"]`)!)
      fireEvent.click(container.querySelector(`[data-square="${exercise.targetTo}"]`)!)
      expect(screen.getByText(exercise.feedback.correct)).toBeTruthy()
      if (index < reviewExercises.length - 1) await user.click(screen.getByRole('button', { name: /Continuar:/ }))
    }
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByText(/Has terminado el repaso/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Repetir el ejercicio' }))
    const lastExercise = reviewExercises[reviewExercises.length - 1]
    expect(screen.queryByText(lastExercise.explanation)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    expect(loadProgress(localStorage, lastExercise.id).firstAttemptCorrect).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Volver a las lecciones' }))
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByRole('heading', { name: 'El caballo salta en forma de L' })).toBeTruthy()
  })

  it('supports the destination selector and gives feedback on a legal alternative', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    fireEvent.click(container.querySelector('[data-square="d4"]')!)
    fireEvent.click(container.querySelector('[data-square="b5"]')!)
    expect(screen.getByText(reviewExercises[0].feedback.otherLegal)).toBeTruthy()
    expect(screen.queryByText(reviewExercises[0].explanation)).toBeNull()
    const selector = screen.getByRole('textbox', { name: '¿Prefieres elegir la casilla?' })
    act(() => selector.focus())
    await user.keyboard('f5{Enter}')
    await user.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText(reviewExercises[0].feedback.correct)).toBeTruthy()
    const saved = loadProgress(localStorage, reviewExercises[0].id)
    expect(saved.attempts).toBe(2)
    expect(saved.firstAttemptCorrect).toBe(false)
  })

  it('restores six completed reviews and opens the first new challenge without changing saved results', async () => {
    const user = userEvent.setup()
    const originalReviews = reviewExercises.slice(0, 6).map((exercise) => {
      const progress = recordAttempt(createInitialProgress(exercise.id), 'correct')
      saveProgress(progress, localStorage)
      return progress
    })
    const lesson = recordAttempt(createInitialProgress(), 'correct')
    saveProgress(lesson, localStorage)
    const { container, unmount } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    const exercise = reviewExercises[6]
    expect(screen.getByRole('heading', { name: exercise.title })).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('60')
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    expect(screen.queryByText(exercise.hint)).toBeNull()
    fireEvent.click(container.querySelector('[data-square="a1"]')!)
    fireEvent.click(container.querySelector('[data-square="b2"]')!)
    expect(screen.getByText(exercise.feedback.illegal)).toBeTruthy()
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    expect(screen.getByText(exercise.hint)).toBeTruthy()
    fireEvent.click(container.querySelector('[data-square="a1"]')!)
    fireEvent.click(container.querySelector('[data-square="b1"]')!)
    expect(screen.getByText(exercise.explanation)).toBeTruthy()
    expect(loadProgress(localStorage, exercise.id)).toMatchObject({ completed: true, attempts: 2, hintsUsed: 1, firstAttemptCorrect: false })
    for (const progress of originalReviews) expect(loadProgress(localStorage, progress.lessonId)).toEqual(progress)
    expect(loadProgress(localStorage)).toEqual(lesson)
    unmount()
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    expect(screen.getByRole('heading', { name: reviewExercises[7].title })).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('70')
  })
})
