import { lazy } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PrimeProvider } from '../../providers/prime-provider'
import { FeatureBoundary } from './feature-boundary'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('feature loading boundary', () => {
  it('announces loading until a deferred module resolves', async () => {
    let resolve!: (module: { default: () => React.JSX.Element }) => void
    const Deferred = lazy(() => new Promise<{ default: () => React.JSX.Element }>((done) => { resolve = done }))
    render(<FeatureBoundary label="las tácticas"><Deferred /></FeatureBoundary>)
    expect(screen.getByRole('status').textContent).toBe('Cargando las tácticas…')
    await act(async () => { resolve({ default: () => <h1>Tácticas listas</h1> }) })
    expect(await screen.findByRole('heading', { name: 'Tácticas listas' })).toBeTruthy()
  })

  it('offers a return action and warns about unsaved changes after a module failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Failed = lazy(() => Promise.reject(new Error('Chunk unavailable')))
    const back = vi.fn()
    render(<PrimeProvider><FeatureBoundary label="Mi avance" onBack={back}><Failed /></FeatureBoundary></PrimeProvider>)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/cambios que no se hayan podido guardar/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Recargar aplicación' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(back).toHaveBeenCalledOnce()
  })
})
