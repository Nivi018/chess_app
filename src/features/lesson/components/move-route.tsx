import type { Square } from 'chess.js'

function point(square: Square) {
  return { x: (square.charCodeAt(0) - 97 + .5) * 12.5, y: (8 - Number(square[1]) + .5) * 12.5 }
}

export function MoveRoute({ from, to }: { from: Square; to: Square }) {
  const start = point(from)
  const end = point(to)
  const columns = Math.abs(to.charCodeAt(0) - from.charCodeAt(0))
  const rows = Math.abs(Number(to[1]) - Number(from[1]))
  const isKnightJump = (columns === 1 && rows === 2) || (columns === 2 && rows === 1)
  const path = isKnightJump
    ? `M${start.x} ${start.y} L${start.x} ${end.y} L${end.x} ${end.y}`
    : `M${start.x} ${start.y} L${end.x} ${end.y}`
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      <svg className="size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          className="animate-route-draw fill-none stroke-[#b18500] [stroke-dasharray:3.6_2.6] [stroke-linecap:round] [stroke-width:1.25] motion-reduce:animate-none"
          d={path}
        />
        {[start, end].map((p, i) => <circle key={i} className="fill-signal stroke-ink [stroke-width:.7]" cx={p.x} cy={p.y} r="2.1" />)}
      </svg>
    </div>
  )
}
