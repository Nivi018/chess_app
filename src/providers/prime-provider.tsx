import type { PropsWithChildren } from 'react'
import { PrimeReactProvider } from 'primereact/api'

export function PrimeProvider({ children }: PropsWithChildren) {
  return <PrimeReactProvider value={{ unstyled: true }}>{children}</PrimeReactProvider>
}
