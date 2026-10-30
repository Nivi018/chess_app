import { Button as PrimeButton } from 'primereact/button'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const buttonVariants = {
  primary:
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-[#0e615a] bg-teal px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#0e6b63] active:bg-[#0e615a] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-signal-deep disabled:cursor-not-allowed disabled:opacity-[.62]',
  signal:
    'inline-flex min-h-[42px] min-w-[106px] items-center justify-center rounded-control border border-[#8b6c06] bg-signal px-[15px] text-[13px] font-bold text-ink transition-colors hover:bg-[#ffdc5d] active:bg-[#e8bd2f] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-signal-deep disabled:cursor-not-allowed disabled:opacity-[.62]',
  ghost:
    'inline-flex items-center justify-center gap-[5px] rounded-control bg-transparent px-2 py-2 text-[12px] font-bold text-[#1a5b52] transition-colors hover:text-[#0e4039] hover:underline hover:underline-offset-[3px] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-signal-deep disabled:cursor-not-allowed disabled:opacity-[.62]',
  nav:
    'flex min-h-[46px] w-full items-center gap-[11px] rounded-md bg-transparent px-3 text-left text-sm font-medium text-[#35514c] transition-colors hover:bg-[#d6e3dc] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-deep',
  navActive:
    'flex min-h-[46px] w-full items-center gap-[11px] rounded-md bg-[#d2e0d8] px-3 text-left text-sm font-bold text-[#103e39] transition-colors hover:bg-[#cbdcd3] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-deep',
} as const

export type ButtonVariant = keyof typeof buttonVariants

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <PrimeButton
      unstyled
      {...props}
      type={type}
      pt={{ root: { className: `${buttonVariants[variant]} ${className}`.trim() } }}
    />
  )
}
