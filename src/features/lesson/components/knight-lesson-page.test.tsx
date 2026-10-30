import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { PrimeProvider } from '../../../providers/prime-provider'
import { KnightLessonPage } from './knight-lesson-page'

function renderLesson() {
  return render(
    <PrimeProvider>
      <KnightLessonPage />
    </PrimeProvider>,
  )
}

describe('KnightLessonPage', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
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
})
