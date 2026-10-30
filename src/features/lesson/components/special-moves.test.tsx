import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../../providers/prime-provider'
import { LessonPage } from './lesson-page'
import { Academy } from '../../academy/academy'
import { specialMoveLessons } from '../../../content/lessons/special-moves'
import { reviewSpecialExercises } from '../../../content/review-special-exercises'
import { lessons } from '../../../content/lessons'
import { reviewExercises } from '../../../content/review-exercises'
import { createInitialProgress, loadProgress, recordAttempt, saveProgress } from '../../../domain/lesson'

function renderActivity(index: number, reviewMode = false) {
  const activity = (reviewMode ? reviewSpecialExercises : specialMoveLessons)[index]
  return render(<PrimeProvider><LessonPage catalog={[activity]} reviewMode={reviewMode} /></PrimeProvider>)
}

function clickMove(container: HTMLElement, from: string, to: string) {
  fireEvent.click(container.querySelector(`[data-square="${from}"]`)!)
  fireEvent.click(container.querySelector(`[data-square="${to}"]`)!)
}

describe('special move experience', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64, toJSON: () => ({}),
    })
  })
  afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

  it('offers four promotion pieces after a destination and cancels without recording an attempt', async () => {
    const user = userEvent.setup()
    const { container } = renderActivity(1)
    clickMove(container, 'a7', 'a8')
    expect(screen.getByRole('group', { name: 'Elige la pieza de promoción' })).toBeTruthy()
    for (const name of ['Dama', 'Torre', 'Alfil', 'Caballo']) expect(screen.getByRole('button', { name })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dama' }))
    expect(screen.getByRole('button', { name: 'Comprobar' }).hasAttribute('disabled')).toBe(true)
    expect(container.querySelector('[data-square="a7"] [data-piece="wP"]')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cancelar promoción' }))
    expect(screen.queryByRole('group', { name: 'Elige la pieza de promoción' })).toBeNull()
    expect(loadProgress(localStorage, specialMoveLessons[1].id).attempts).toBe(0)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Comprobar' }))
  })

  it('supports the destination selector and promotion entirely by keyboard, then restores and replays', async () => {
    const user = userEvent.setup()
    const { container, unmount } = renderActivity(1)
    const selector = screen.getByRole('textbox', { name: '¿Prefieres elegir la casilla?' })
    act(() => selector.focus())
    await user.keyboard('a8{Enter}')
    expect(container.querySelectorAll('option[value="a8"]')).toHaveLength(1)
    await user.keyboard('{Tab}{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dama' }))
    await user.keyboard('{Enter}')
    expect(screen.getByText(specialMoveLessons[1].feedback.correct)).toBeTruthy()
    await waitFor(() => expect(container.querySelector('[data-square="a8"] [data-piece="wQ"]')).toBeTruthy())
    expect(loadProgress(localStorage, specialMoveLessons[1].id)).toMatchObject({ attempts: 1, completed: true, firstAttemptCorrect: true })
    unmount()
    const restored = renderActivity(1)
    expect(restored.container.querySelector('[data-square="a8"] [data-piece="wQ"]')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Repetir el ejercicio' }))
    await waitFor(() => expect(restored.container.querySelector('[data-square="a7"] [data-piece="wP"]')).toBeTruthy())
  })

  it('withholds the review explanation and recognizes a legal promotion that misses the check goal', async () => {
    const user = userEvent.setup()
    const { container } = renderActivity(1, true)
    const exercise = reviewSpecialExercises[1]
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    clickMove(container, 'e7', 'e8')
    await user.click(screen.getByRole('button', { name: 'Dama' }))
    expect(screen.getByText(exercise.feedback.otherLegal)).toBeTruthy()
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    expect(container.querySelector('[data-square="e7"] [data-piece="wP"]')).toBeTruthy()
    clickMove(container, 'e7', 'e8')
    await user.click(screen.getByRole('button', { name: 'Caballo' }))
    expect(screen.getByText(exercise.explanation)).toBeTruthy()
    await waitFor(() => expect(container.querySelector('[data-square="e8"] [data-piece="wN"]')).toBeTruthy())
    expect(loadProgress(localStorage, exercise.id)).toMatchObject({ attempts: 2, completed: true, firstAttemptCorrect: false })
  })

  it('preserves a pending promotion when visiting Mi avance and returning', async () => {
    const user = userEvent.setup()
    const { container } = render(<PrimeProvider><Academy /></PrimeProvider>)
    await user.click(screen.getByRole('button', { name: /12\. Promociona un peón/ }))
    clickMove(container, 'a7', 'a8')
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    await user.click(screen.getByRole('button', { name: 'Volver a la actividad' }))
    expect(screen.getByRole('group', { name: 'Elige la pieza de promoción' })).toBeTruthy()
    expect(loadProgress(localStorage, specialMoveLessons[1].id).attempts).toBe(0)
    await user.click(screen.getByRole('button', { name: 'Dama' }))
    expect(loadProgress(localStorage, specialMoveLessons[1].id).completed).toBe(true)
  })

  it('moves both castling pieces and shows two routes only after completion', async () => {
    const { container } = renderActivity(0)
    expect(container.querySelectorAll('path.animate-route-draw')).toHaveLength(0)
    expect(screen.getByText(specialMoveLessons[0].positionNote!)).toBeTruthy()
    clickMove(container, 'e1', 'g1')
    await waitFor(() => expect(container.querySelector('[data-square="g1"] [data-piece="wK"]')).toBeTruthy())
    expect(container.querySelector('[data-square="f1"] [data-piece="wR"]')).toBeTruthy()
    expect(container.querySelector('[data-square="h1"] [data-piece="wR"]')).toBeNull()
    expect(container.querySelectorAll('path.animate-route-draw')).toHaveLength(2)
  })

  it('removes the en-passant pawn from its actual square, then restores the setup for replay', async () => {
    const user = userEvent.setup()
    const { container } = renderActivity(2)
    expect(screen.getByText(specialMoveLessons[2].positionNote!)).toBeTruthy()
    clickMove(container, 'e5', 'd6')
    await waitFor(() => expect(container.querySelector('[data-square="d6"] [data-piece="wP"]')).toBeTruthy())
    expect(container.querySelector('[data-square="d5"] [data-piece="bP"]')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Repetir el ejercicio' }))
    await waitFor(() => expect(container.querySelector('[data-square="d5"] [data-piece="bP"]')).toBeTruthy())
    expect(container.querySelector('[data-square="e5"] [data-piece="wP"]')).toBeTruthy()
  })

  it('preserves all original ten lesson and review records and opens the newly pending activities', async () => {
    const user = userEvent.setup()
    const originals = [...lessons.slice(0, 10), ...reviewExercises.slice(0, 10)].map((activity) => {
      const progress = recordAttempt(createInitialProgress(activity.id), 'correct')
      saveProgress(progress, localStorage)
      return progress
    })
    render(<PrimeProvider><Academy /></PrimeProvider>)
    expect(screen.getByRole('heading', { name: specialMoveLessons[0].title })).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(1000 / lessons.length)
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    expect(screen.getByRole('heading', { name: reviewSpecialExercises[0].title })).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(1000 / reviewExercises.length)
    for (const original of originals) expect(loadProgress(localStorage, original.lessonId)).toEqual(original)
  })
})
