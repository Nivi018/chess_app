import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../../providers/prime-provider'
import { LessonPage } from './lesson-page'
import { createInitialProgress, recordAttempt, saveProgress } from '../../../domain/lesson'
import { lessons } from '../../../content/lessons'

function renderLesson() {
  return render(
    <PrimeProvider>
      <LessonPage />
    </PrimeProvider>,
  )
}

describe('LessonPage', () => {
  beforeEach(() => {
    // JSDOM has no layout; the board's animation requires measured squares.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64,
      toJSON: () => ({}),
    })
  })
  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('composes the lesson from accessible UI wrappers', () => {
    renderLesson()

    expect(screen.getByRole('heading', { name: 'El caballo salta en forma de L' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Comprobar' })).toBeTruthy()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('reveals the optional lesson hint on request', async () => {
    const user = userEvent.setup()
    renderLesson()

    await user.click(screen.getByRole('button', { name: 'Necesito una pista' }))

    expect(screen.getByText(/Cuenta dos filas hacia arriba desde b1/)).toBeTruthy()
  })

  it('allows navigation between lessons with independent exercise state', async () => {
    const user = userEvent.setup()
    const { container } = renderLesson()
    fireEvent.click(container.querySelector('[data-square="b1"]')!)
    fireEvent.click(container.querySelector('[data-square="c3"]')!)
    expect(screen.getByRole('button', { name: /Continuar:/ })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Continuar:/ }))
    expect(screen.getByRole('heading', { name: 'La torre se mueve en línea recta' })).toBeTruthy()
    expect(screen.getByText('TU TURNO')).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(100 / lessons.length)
    fireEvent.click(container.querySelector('[data-square="a1"]')!)
    fireEvent.click(container.querySelector('[data-square="a4"]')!)
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(200 / lessons.length)
    expect(screen.getByRole('button', { name: /Continuar: El alfil/ })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /1\. El caballo/ }))
    expect(screen.getByRole('heading', { name: 'El caballo salta en forma de L' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Repetir el ejercicio' })).toBeTruthy()
  })

  it('opens the next pending lesson using previously saved knight progress', () => {
    saveProgress(recordAttempt(createInitialProgress(), 'correct'), localStorage)
    renderLesson()
    expect(screen.getByRole('heading', { name: 'La torre se mueve en línea recta' })).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(100 / lessons.length)
  })

  it('preserves both original completions when the course gains four lessons', () => {
    for (const lesson of lessons.slice(0, 2)) {
      saveProgress(recordAttempt(createInitialProgress(lesson.id), 'correct'), localStorage)
    }
    renderLesson()
    expect(screen.getByRole('heading', { name: 'El alfil recorre las diagonales' })).toBeTruthy()
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(200 / lessons.length)
  })

  it('preserves the six completed lessons and starts the new check lessons', () => {
    for (const lesson of lessons.slice(0, 6)) {
      saveProgress(recordAttempt(createInitialProgress(lesson.id), 'correct'), localStorage)
    }
    const originalProgress = lessons.slice(0, 6).map((lesson) => localStorage.getItem(`chess-academy:${lesson.id}:v1`))
    renderLesson()
    expect(screen.getByRole('heading', { name: 'Sal del jaque con el rey' })).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('60')
    expect(lessons.slice(0, 6).map((lesson) => localStorage.getItem(`chess-academy:${lesson.id}:v1`))).toEqual(originalProgress)
  })

  it('completes all ten lessons in order and restores the finished course', async () => {
    const user = userEvent.setup()
    const { container, unmount } = renderLesson()
    for (const [index, lesson] of lessons.entries()) {
      expect(screen.getByRole('heading', { name: lesson.title })).toBeTruthy()
      fireEvent.click(container.querySelector(`[data-square="${lesson.targetFrom}"]`)!)
      fireEvent.click(container.querySelector(`[data-square="${lesson.targetTo}"]`)!)
      expect(screen.getByText(lesson.feedback.correct)).toBeTruthy()
      if (index < lessons.length - 1) {
        await user.click(screen.getByRole('button', { name: /Continuar:/ }))
      }
    }
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByText(/Has terminado las lecciones disponibles/)).toBeTruthy()
    unmount()
    renderLesson()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByRole('heading', { name: lessons[0].title })).toBeTruthy()
  })
})
