import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../providers/prime-provider'
import { lessons } from '../../content/lessons'
import { reviewExercises } from '../../content/review-exercises'
import { createInitialProgress, loadProgress, recordAttempt, recordHint, saveProgress } from '../../domain/lesson'
import { Academy } from './academy'

function renderAcademy() {
  return render(<PrimeProvider><Academy /></PrimeProvider>)
}

function completeLessons() {
  for (const lesson of lessons) saveProgress(recordAttempt(createInitialProgress(lesson.id), 'correct'), localStorage)
}

describe('Mi avance', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64, toJSON: () => ({}),
    })
  })
  afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

  it('shows an honest empty state and opens the recommended first lesson', async () => {
    const user = userEvent.setup()
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByRole('heading', { name: 'Mi avance' })).toBe(document.activeElement)
    expect(screen.getByRole('button', { name: 'Mi avance' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getAllByText(`0 / ${lessons.length}`)).toHaveLength(3)
    expect(screen.getByText(/primera lección pendiente/)).toBeTruthy()
    expect(screen.getByText(/no tu ELO/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continuar aprendiendo' }))
    expect(screen.getByRole('heading', { name: lessons[0].title })).toBeTruthy()
  })

  it('updates completion live and returns to the exact activity with its hint state', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    fireEvent.click(container.querySelector('[data-square="b1"]')!)
    fireEvent.click(container.querySelector('[data-square="c3"]')!)
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText(/primera lección pendiente/)).toBeTruthy()
    const suggestion = screen.getByRole('region', { name: 'Tu siguiente paso' })
    expect(within(suggestion).getByText(lessons[1].title)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: `Abrir: ${lessons[1].title}` }))
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    await user.click(screen.getByRole('button', { name: 'Volver a la actividad' }))
    expect(screen.getByRole('heading', { name: lessons[1].title })).toBeTruthy()
    expect(screen.getByText(lessons[1].hint)).toBeTruthy()
  })

  it('recommends review after lessons and does not count lesson records as review results', async () => {
    const user = userEvent.setup()
    completeLessons()
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByRole('progressbar', { name: 'Lecciones completadas en Mi avance' }).getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByRole('progressbar', { name: 'Repasos resueltos en Mi avance' }).getAttribute('aria-valuenow')).toBe('0')
    await user.click(screen.getByRole('button', { name: 'Continuar aprendiendo' }))
    expect(screen.getByRole('heading', { name: reviewExercises[0].title })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Tu repaso' })).getAllByText(`0 / ${reviewExercises.length}`)).toHaveLength(2)
  })

  it('opens a suggested completed review in replay without revealing the answer or changing its first result', async () => {
    const user = userEvent.setup()
    completeLessons()
    const exercise = reviewExercises[6]
    for (const review of reviewExercises) {
      const initial = createInitialProgress(review.id)
      saveProgress(recordAttempt(review.id === exercise.id ? recordHint(initial) : initial, 'correct'), localStorage)
    }
    const saved = loadProgress(localStorage, exercise.id)
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText(/En tu primer resultado necesitaste/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Volver a practicar' }))
    expect(screen.getByRole('heading', { name: exercise.title })).toBeTruthy()
    expect(screen.queryByText(exercise.explanation)).toBeNull()
    expect(loadProgress(localStorage, exercise.id)).toEqual(saved)
    fireEvent.click(container.querySelector(`[data-square="${exercise.targetFrom}"]`)!)
    fireEvent.click(container.querySelector(`[data-square="${exercise.targetTo}"]`)!)
    expect(loadProgress(localStorage, exercise.id)).toMatchObject({ completed: true, attempts: 2, firstAttemptCorrect: false, completedAt: saved.completedAt })
  })

  it('marks older completed reviews as unknown rather than inventing a first result', async () => {
    const user = userEvent.setup()
    const exercise = reviewExercises[0]
    saveProgress({ lessonId: exercise.id, completed: true, attempts: 1, completedAt: '2026-10-30T12:00:00Z' }, localStorage)
    localStorage.setItem(`chess-academy:${reviewExercises[1].id}:v1`, '{invalid')
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText('1 repaso completado sin dato del primer intento.')).toBeTruthy()
    expect(screen.getByText('Primer intento sin registrar')).toBeTruthy()
    expect(screen.getByText(`0 de ${reviewExercises.length} al primer intento sin pistas.`)).toBeTruthy()
  })

  it('keeps session results across modes when writing storage fails and warns in Mi avance', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    const { container } = renderAcademy()
    fireEvent.click(container.querySelector('[data-square="b1"]')!)
    fireEvent.click(container.querySelector('[data-square="c3"]')!)
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    expect(screen.getByText('No se pudo guardar en este navegador')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText(/al recargar podrías perder/)).toBeTruthy()
    expect(Number(screen.getByRole('progressbar', { name: 'Lecciones completadas en Mi avance' }).getAttribute('aria-valuenow'))).toBeCloseTo(100 / lessons.length)
    await user.click(screen.getByRole('button', { name: `Repetir: ${lessons[0].title}` }))
    expect(screen.getByRole('heading', { name: lessons[0].title })).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(100 / lessons.length)
    expect(screen.getByRole('button', { name: 'Comprobar' }).hasAttribute('disabled')).toBe(false)
  })

  it('handles a browser that blocks all storage access', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText(/al recargar podrías perder/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continuar aprendiendo' })).toBeTruthy()
  })

  it('clears the unsaved warning only after the affected activity is actually saved', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('Quota exceeded') })
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    await user.click(screen.getByRole('button', { name: 'Repasar movimientos' }))
    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))
    expect(screen.getByText('No se pudo guardar en este navegador')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByText(/al recargar podrías perder/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: `Abrir: ${lessons[0].title}` }))
    fireEvent.click(container.querySelector('[data-square="b1"]')!)
    fireEvent.click(container.querySelector('[data-square="c3"]')!)
    expect(screen.queryByText('No se pudo guardar en este navegador')).toBeNull()
    expect(loadProgress(localStorage)).toMatchObject({ completed: true, hintsUsed: 1 })
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.queryByText(/al recargar podrías perder/)).toBeNull()
  })
})
