import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import { PrimeProvider } from '../../providers/prime-provider'
import { Academy } from './academy'
import { tactics } from '../../content/tactics'
import { lessons } from '../../content/lessons'
import { reviewExercises } from '../../content/review-exercises'
import { createInitialProgress, loadProgress, recordAttempt, saveProgress } from '../../domain/lesson'

function renderAcademy() {
  return render(<PrimeProvider><Academy /></PrimeProvider>)
}

function clickMove(container: HTMLElement, from: string, to: string) {
  fireEvent.click(container.querySelector(`[data-square="${from}"]`)!)
  fireEvent.click(container.querySelector(`[data-square="${to}"]`)!)
}

describe('tactics mode', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64, toJSON: () => ({}),
    })
  })
  afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

  it('plays a two-move fork with a prepared reply and counts one solved line', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Practicar tácticas' }))
    expect(screen.getByRole('heading', { name: tactics[0].title })).toBeTruthy()
    clickMove(container, 'd5', 'f6')
    expect(screen.getByText(/Respuesta rival preparada: Kh6/)).toBeTruthy()
    await waitFor(() => expect(container.querySelector('[data-square="h6"] [data-piece="bK"]')).toBeTruthy())
    clickMove(container, 'f6', 'g8')
    expect(screen.getAllByText(tactics[0].explanation)).toHaveLength(2)
    await waitFor(() => expect(container.querySelector('[data-square="g8"] [data-piece="wN"]')).toBeTruthy())
    expect(loadProgress(localStorage, tactics[0].id)).toMatchObject({ attempts: 1, completed: true, firstAttemptCorrect: true })
    expect(loadProgress(localStorage, lessons[0].id).attempts).toBe(0)
    expect(loadProgress(localStorage, reviewExercises[0].id).attempts).toBe(0)
  })

  it('keeps an in-progress line when opening Mi avance and returning', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Practicar tácticas' }))
    clickMove(container, 'd5', 'f6')
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByRole('heading', { name: 'Mi avance' })).toBe(document.activeElement)
    expect(screen.getByRole('progressbar', { name: 'Tácticas resueltas en Mi avance' }).getAttribute('aria-valuenow')).toBe('0')
    await user.click(screen.getByRole('button', { name: 'Volver a la actividad' }))
    expect(screen.getByRole('heading', { name: tactics[0].title })).toBeTruthy()
    expect(screen.getAllByText(/Kh6/).length).toBeGreaterThan(0)
    expect(container.querySelector('[data-square="h6"] [data-piece="bK"]')).toBeTruthy()
  })

  it('counts a wrong legal move and completes the prepared mate line through keyboard controls', async () => {
    const user = userEvent.setup()
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Practicar tácticas' }))
    await user.click(screen.getByRole('button', { name: `2. ${tactics[1].title}` }))
    clickMove(container, 'd1', 'e2')
    expect(screen.getByText(/legal, pero no continúa/)).toBeTruthy()
    expect(loadProgress(localStorage, tactics[1].id)).toMatchObject({ attempts: 1, firstAttemptCorrect: false })
    let selector = screen.getByRole('textbox', { name: 'Elegir una jugada legal' })
    act(() => selector.focus())
    await user.keyboard('h5{Enter}')
    await user.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText(/Respuesta rival preparada: Nf6/)).toBeTruthy()
    selector = screen.getByRole('textbox', { name: 'Elegir una jugada legal' })
    act(() => selector.focus())
    await user.keyboard('f7{Enter}')
    await user.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getAllByText(tactics[1].explanation)).toHaveLength(2)
    await waitFor(() => expect(container.querySelector('[data-square="f7"] [data-piece="wQ"]')).toBeTruthy())
    expect(new Chess(tactics[1].startFen).isCheckmate()).toBe(false)
    expect(loadProgress(localStorage, tactics[1].id)).toMatchObject({ attempts: 2, completed: true, firstAttemptCorrect: false })
    expect(screen.queryByText(/Has completado las tácticas disponibles/)).toBeNull()
    expect(screen.getByText(/Puedes elegir otra pendiente/)).toBeTruthy()
  }, 15000)

  it('suggests tactics after lessons and reviews and can launch the exact recommended puzzle', async () => {
    const user = userEvent.setup()
    for (const activity of [...lessons, ...reviewExercises]) saveProgress(recordAttempt(createInitialProgress(activity.id), 'correct'), localStorage)
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    const region = screen.getByRole('region', { name: 'Tu siguiente paso' })
    expect(within(region).getByText(tactics[0].title)).toBeTruthy()
    await user.click(within(region).getByRole('button', { name: 'Continuar aprendiendo' }))
    expect(screen.getByRole('heading', { name: tactics[0].title })).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Progreso de tácticas' }).getAttribute('aria-valuenow')).toBe('0')
  })

  it('marks the saved tactic for replay without overwriting its first result', async () => {
    const user = userEvent.setup()
    const saved = recordAttempt(createInitialProgress(tactics[0].id), 'correct')
    saveProgress(saved, localStorage)
    renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    await user.click(screen.getByRole('button', { name: `Repetir: ${tactics[0].title}` }))
    expect(screen.getByRole('heading', { name: tactics[0].title })).toBeTruthy()
    expect(screen.queryByText(tactics[0].explanation)).toBeNull()
  })

  it('keeps a completed tactic in memory and warns consistently when saving fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    const { container } = renderAcademy()
    await user.click(screen.getByRole('button', { name: 'Practicar tácticas' }))
    clickMove(container, 'd5', 'f6')
    clickMove(container, 'f6', 'g8')
    expect(screen.getByText('No se pudo guardar en este navegador')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByRole('progressbar', { name: 'Tácticas resueltas en Mi avance' }).getAttribute('aria-valuenow')).toBe('50')
    await user.click(screen.getByRole('button', { name: 'Volver a las lecciones' }))
    expect(screen.getByText('No se pudo guardar en este navegador')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mi avance' }))
    expect(screen.getByRole('progressbar', { name: 'Tácticas resueltas en Mi avance' }).getAttribute('aria-valuenow')).toBe('50')
  })
})
