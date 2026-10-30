import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MoveRoute } from './move-route'

describe('lesson move visualization', () => {
  afterEach(cleanup)

  it('draws bishop and queen diagonals directly, not as a knight L', () => {
    const { container } = render(<MoveRoute from="c1" to="f4" />)
    expect(container.querySelector('path')?.getAttribute('d')).toBe('M31.25 93.75 L68.75 56.25')
  })

  it('retains the two-part explanatory path for the knight', () => {
    const { container } = render(<MoveRoute from="b1" to="c3" />)
    expect(container.querySelector('path')?.getAttribute('d')).toBe('M18.75 93.75 L18.75 68.75 L31.25 68.75')
  })
})
