import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../../providers/prime-provider'
import { LessonPage } from './lesson-page'
import { createInitialProgress, recordAttempt, saveProgress } from '../../../domain/lesson'

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
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
    fireEvent.click(container.querySelector('[data-square="a1"]')!)
    fireEvent.click(container.querySelector('[data-square="a4"]')!)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByText(/Has terminado las lecciones disponibles/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /1\. El caballo/ }))
    expect(screen.getByRole('heading', { name: 'El caballo salta en forma de L' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Repetir el ejercicio' })).toBeTruthy()
  })

  it('opens the next pending lesson using previously saved knight progress', () => {
    saveProgress(recordAttempt(createInitialProgress(), 'correct'), localStorage)
    renderLesson()
    expect(screen.getByRole('heading', { name: 'La torre se mueve en línea recta' })).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
  })
})
