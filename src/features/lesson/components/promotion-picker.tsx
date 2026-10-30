import { useEffect, useRef } from 'react'
import { Button } from '../../../components/ui/button'
import type { PromotionPiece } from '../../../domain/lesson'
import type { PendingPromotion } from '../hooks/use-lesson'

const names: Record<PromotionPiece, string> = { q: 'Dama', r: 'Torre', b: 'Alfil', n: 'Caballo' }

export function PromotionPicker({ promotion, onChoose, onCancel }: {
  promotion: PendingPromotion
  onChoose: (piece: PromotionPiece) => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLFieldSetElement>(null)
  useEffect(() => { ref.current?.querySelector('button')?.focus() }, [])

  return (
    <fieldset ref={ref} className="mt-4 border-y border-line py-4">
      <legend className="px-1 text-sm font-bold text-ink">Elige la pieza de promoción</legend>
      <p className="mb-3 text-sm leading-relaxed text-muted">Tu peón va de {promotion.from} a {promotion.to}. Elige su nueva pieza para comprobar la jugada.</p>
      <div className="grid grid-cols-2 gap-2">
        {promotion.choices.map((piece) => <Button key={piece} variant="signal" onClick={() => onChoose(piece)}>{names[piece]}</Button>)}
      </div>
      <Button variant="ghost" className="mt-2 min-h-11" onClick={onCancel}>Cancelar promoción</Button>
    </fieldset>
  )
}
