import type { HTMLAttributes } from 'react'

type PanelProps = HTMLAttributes<HTMLDivElement>

export function Panel({ className = '', ...props }: PanelProps) {
  return (
    <div
      className={`min-w-0 rounded-panel border border-line bg-paper shadow-panel ${className}`.trim()}
      {...props}
    />
  )
}
