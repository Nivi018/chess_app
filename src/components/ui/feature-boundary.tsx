import { Component, Suspense, type ReactNode } from 'react'
import { Button } from './button'

type FeatureBoundaryProps = { children: ReactNode; label: string; onBack?: () => void }

class FeatureErrorBoundary extends Component<FeatureBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return (
      <section role="alert" className="mx-auto max-w-[65ch] border-y border-line bg-paper px-5 py-8 text-ink">
        <h2 className="text-xl font-bold">No se pudo abrir {this.props.label}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{this.props.onBack ? 'Puedes volver a la actividad anterior o recargar la aplicación.' : 'Recarga la aplicación para volver a intentarlo.'} Los resultados guardados se conservan; si recargas, los cambios que no se hayan podido guardar podrían perderse.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {this.props.onBack && <Button className="max-w-fit" onClick={this.props.onBack}>Volver</Button>}
          <Button variant="ghost" onClick={() => window.location.reload()}>Recargar aplicación</Button>
        </div>
      </section>
    )
    return this.props.children
  }
}

export function FeatureBoundary({ children, label, onBack }: FeatureBoundaryProps) {
  return (
    <FeatureErrorBoundary label={label} onBack={onBack}>
      <Suspense fallback={<section role="status" className="mx-auto max-w-[65ch] px-5 py-8 text-sm text-muted">Cargando {label}…</section>}>
        {children}
      </Suspense>
    </FeatureErrorBoundary>
  )
}
