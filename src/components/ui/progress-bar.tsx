type ProgressBarProps = {
  value: number
  label: string
  className?: string
}

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      className={`h-1.5 overflow-hidden rounded-track bg-[#c5d5cd] ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <span
        className="block h-full rounded-[inherit] bg-teal transition-[width] duration-[340ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}
