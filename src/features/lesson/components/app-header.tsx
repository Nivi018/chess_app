import { ArrowDownToLine, X } from 'lucide-react'
import type { StorageState } from '../hooks/use-lesson'

type AppHeaderProps = {
  storageState: StorageState
}

export function AppHeader({ storageState }: AppHeaderProps) {
  const status = {
    saved: 'Progreso guardado aquí',
    ready: 'El progreso se guarda en este dispositivo',
    unavailable: 'No se pudo guardar en este navegador',
  }[storageState]

  return (
    <header className="relative z-10 min-h-[72px] bg-ink text-paper max-mobile:min-h-16">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1600px] items-center justify-between gap-6 px-9 max-mobile:min-h-16 max-mobile:px-[18px]">
        <a
          className="inline-flex items-center gap-3 whitespace-nowrap text-[17px] font-bold tracking-[-.02em] text-inherit no-underline max-mobile:gap-[9px] max-mobile:text-[15px] max-[390px]:text-sm"
          href="#lesson"
          aria-label="Ajedrez desde cero, ir a la lección"
        >
          <span className="grid size-8 shrink-0 place-items-center text-signal max-mobile:size-[27px]" aria-hidden="true">
            <svg className="size-[30px] stroke-current stroke-2 max-mobile:size-[27px]" viewBox="0 0 32 32" fill="none">
              <path d="M5 24h8V8M13 24h6V14h8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="5" cy="24" r="2.5" />
              <circle cx="27" cy="14" r="2.5" />
            </svg>
          </span>
          <span>Ajedrez desde cero</span>
        </a>

        <div
          className={`flex max-w-[250px] items-center gap-[9px] text-[13px] leading-[1.3] text-[#e0ebe5] max-mobile:max-w-[170px] max-mobile:gap-1.5 max-mobile:text-[11px] max-[390px]:max-w-[136px] ${storageState === 'unavailable' ? 'text-[#ffe0d5]' : ''}`}
          aria-live="polite"
        >
          {storageState === 'unavailable' ? (
            <X className="size-4 shrink-0 text-[#ff9a76] max-mobile:w-[14px]" aria-hidden="true" />
          ) : (
            <ArrowDownToLine className="size-4 shrink-0 text-signal max-mobile:w-[14px]" aria-hidden="true" />
          )}
          <span>{status}</span>
        </div>
      </div>
    </header>
  )
}
