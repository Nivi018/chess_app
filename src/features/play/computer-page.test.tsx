import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Academy } from '../academy/academy'
import { PrimeProvider } from '../../providers/prime-provider'
import { createInitialProgress, recordAttempt, saveProgress } from '../../domain/lesson'
import { lessons } from '../../content/lessons'
import { COMPUTER_GAME_KEY, loadComputerGame, saveComputerGame } from './saved-game'

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror = null
  commands: string[] = []
  terminate = vi.fn()
  constructor() { FakeWorker.instances.push(this) }
  postMessage(command: string) {
    this.commands.push(command)
    if (command === 'uci') queueMicrotask(() => this.receive('uciok'))
    if (command === 'isready') queueMicrotask(() => this.receive('readyok'))
  }
  receive(data: string) { this.onmessage?.(new MessageEvent('message', { data })) }
}

async function openGame() {
  const view = render(<PrimeProvider><Academy /></PrimeProvider>)
  await userEvent.click(await screen.findByRole('button', { name: 'Jugar contra el ordenador' }))
  await screen.findByRole('heading', { name: 'Jugar contra el ordenador' })
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Elegir una jugada legal' }).hasAttribute('disabled')).toBe(false))
  return view
}

function move(container: HTMLElement, from: string, to: string) {
  fireEvent.click(container.querySelector(`[data-square="${from}"]`)!)
  fireEvent.click(container.querySelector(`[data-square="${to}"]`)!)
}

beforeEach(() => {
  FakeWorker.instances = []
  vi.stubGlobal('Worker', FakeWorker)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, bottom: 64, right: 64, width: 64, height: 64, toJSON: () => ({}),
  })
})
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('computer game experience', () => {
  it('does not start an engine in lessons or tactics and terminates it on leaving a game', async () => {
    render(<PrimeProvider><Academy /></PrimeProvider>)
    await screen.findByRole('button', { name: 'Jugar contra el ordenador' })
    expect(FakeWorker.instances).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: 'Practicar tácticas' }))
    await screen.findByRole('heading', { name: 'La horquilla del caballo' })
    expect(FakeWorker.instances).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: 'Jugar contra el ordenador' }))
    await screen.findByRole('heading', { name: 'Jugar contra el ordenador' })
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1))
    await userEvent.click(screen.getByRole('button', { name: 'Volver a las lecciones' }))
    await screen.findByRole('heading', { name: lessons[0].title })
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
  }, 15_000)

  it('plays a board move, locks during the reply and preserves the game through Mi avance without changing saved progress', async () => {
    const saved = recordAttempt(createInitialProgress(lessons[0].id), 'correct')
    saveProgress(saved, localStorage)
    const originalStorage = localStorage.getItem(`chess-academy:${lessons[0].id}:v1`)
    const { container } = await openGame()
    move(container, 'e2', 'e4')
    expect(screen.getByText('El ordenador está pensando…')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Elegir una jugada legal' }).hasAttribute('disabled')).toBe(true)
    move(container, 'd2', 'd4')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await act(async () => FakeWorker.instances[0].receive('bestmove e7e5'))
    const history = screen.getByRole('list', { name: 'Historial de jugadas' })
    expect(within(history).getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Mi avance' }))
    await screen.findByRole('heading', { name: 'Mi avance' })
    await userEvent.click(screen.getByRole('button', { name: 'Volver a la actividad' }))
    expect(screen.getByRole('heading', { name: 'Jugar contra el ordenador' })).toBe(document.activeElement)
    expect(container.querySelector('[data-square="e5"] [data-piece="bP"]')).toBeTruthy()
    expect(FakeWorker.instances).toHaveLength(1)
    expect(localStorage.getItem(`chess-academy:${lessons[0].id}:v1`)).toBe(originalStorage)
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
  })

  it('supports keyboard moves and protects restart with an inline confirmation', async () => {
    const user = userEvent.setup()
    await openGame()
    act(() => screen.getByRole('textbox', { name: 'Elegir una jugada legal' }).focus())
    await user.keyboard('e2{Enter}')
    await user.click(screen.getByRole('button', { name: 'Jugar' }))
    await waitFor(() => expect(FakeWorker.instances[0].commands.some((command) => command.startsWith('go '))).toBe(true))
    await user.click(screen.getByRole('button', { name: 'Nueva partida' }))
    expect(screen.getByRole('button', { name: 'Sí, reiniciar' })).toBe(document.activeElement)
    await user.click(screen.getByRole('button', { name: 'Seguir jugando' }))
    expect(FakeWorker.instances).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Nueva partida' }))
    await user.click(screen.getByRole('button', { name: 'Sí, reiniciar' }))
    expect(await screen.findByText(/Todavía no hay jugadas/)).toBeTruthy()
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
    expect(FakeWorker.instances).toHaveLength(2)
  }, 15_000)

  it('offers recovery after a worker failure while retaining the current position', async () => {
    const { container } = await openGame()
    move(container, 'e2', 'e4')
    act(() => FakeWorker.instances[0].onerror?.(new ErrorEvent('error')))
    expect(await screen.findByRole('alert')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar motor' }))
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(2))
    await waitFor(() => expect(FakeWorker.instances[1].commands).toContain('position startpos moves e2e4'))
    await act(async () => FakeWorker.instances[1].receive('bestmove e7e6'))
    expect(container.querySelector('[data-square="e4"] [data-piece="wP"]')).toBeTruthy()
    expect(screen.getByText('1. Negras: e7 → e6 (e6)')).toBeTruthy()
  })

  it('recovers a completed white turn after section changes and a simulated reload', async () => {
    const { container, unmount } = await openGame()
    move(container, 'e2', 'e4')
    await act(async () => FakeWorker.instances[0].receive('bestmove e7e5'))
    await userEvent.click(screen.getByRole('button', { name: 'Volver a las lecciones' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Jugar contra el ordenador' }))
    expect(await screen.findByText(/Partida recuperada en este dispositivo/)).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Historial de jugadas' }).children).toHaveLength(2)
    expect(FakeWorker.instances[1].commands.some((command) => command.startsWith('go '))).toBe(false)
    unmount()
    await openGame()
    expect(screen.getByText(/Partida recuperada en este dispositivo/)).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Historial de jugadas' }).children).toHaveLength(2)
  }, 15_000)

  it('resumes a black turn after reload and does not apply the old worker reply', async () => {
    const original = await openGame()
    move(original.container, 'e2', 'e4')
    original.unmount()
    render(<PrimeProvider><Academy /></PrimeProvider>)
    await userEvent.click(await screen.findByRole('button', { name: 'Jugar contra el ordenador' }))
    await waitFor(() => expect(FakeWorker.instances[1].commands).toContain('position startpos moves e2e4'))
    expect(screen.getByText('El ordenador está pensando…')).toBeTruthy()
    await act(async () => { FakeWorker.instances[0].receive('bestmove e7e5'); FakeWorker.instances[1].receive('bestmove e7e6') })
    expect(screen.getByText('1. Negras: e7 → e6 (e6)')).toBeTruthy()
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e6'])
  })

  it('requires confirmation to discard an incompatible saved game and never silently overwrites it', async () => {
    localStorage.setItem(COMPUTER_GAME_KEY, '{"version":9,"moves":[]}')
    render(<PrimeProvider><Academy /></PrimeProvider>)
    await userEvent.click(await screen.findByRole('button', { name: 'Jugar contra el ordenador' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('No lo hemos sobrescrito'))
    expect(screen.getByRole('textbox', { name: 'Elegir una jugada legal' }).hasAttribute('disabled')).toBe(true)
    expect(FakeWorker.instances).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: 'Nueva partida' }))
    expect(screen.getByText('¿Descartar el registro guardado?')).toBeTruthy()
    expect(localStorage.getItem(COMPUTER_GAME_KEY)).toContain('"version":9')
    expect(screen.getByText('El tablero está bloqueado hasta recuperar o descartar el registro guardado.')).toBeTruthy()
    expect(screen.getByText('No se ha recuperado un historial. Tu registro guardado sigue intacto.')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(localStorage.getItem(COMPUTER_GAME_KEY)).toContain('"version":9')
    await userEvent.click(screen.getByRole('button', { name: 'Nueva partida' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, reiniciar' }))
    expect(loadComputerGame(localStorage).moves).toEqual([])
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1))
  })

  it('warns if saving fails and retries without resetting the live game', async () => {
    saveComputerGame(localStorage, ['e2e4', 'e7e5'])
    const { container } = await openGame()
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') })
    move(container, 'g1', 'f3')
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('podrías perder los cambios'))
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
    write.mockRestore()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar guardado' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Partida guardada en este dispositivo.')).toBeTruthy()
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5', 'g1f3'])
  })
})
