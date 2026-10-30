import { ChevronDown } from 'lucide-react'
import { Dropdown } from 'primereact/dropdown'

export type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SelectField({
  id,
  label,
  placeholder,
  value,
  options,
  onValueChange,
  disabled = false,
  className = '',
}: SelectFieldProps) {
  return (
    <div className={`grid min-w-0 gap-2 ${className}`}>
      <label className="text-xs font-semibold text-muted" htmlFor={id}>
        {label}
      </label>
      <Dropdown
        unstyled
        inputId={id}
        value={value || null}
        onChange={(event) => onValueChange(String(event.value ?? ''))}
        options={options}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        dropdownIcon={<ChevronDown size={16} aria-hidden="true" />}
        disabled={disabled}
        className="w-full"
        panelClassName="rounded-control border border-line bg-paper shadow-panel"
        pt={{
          root: { className: 'flex min-h-[42px] w-full items-center gap-3 rounded-control border border-[#829b90] bg-white px-3 text-sm text-ink transition-colors focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-signal-deep' },
          input: { className: 'min-w-0 flex-1 outline-none' },
          trigger: { className: 'ml-auto inline-flex shrink-0 items-center text-muted' },
          wrapper: { className: 'min-w-0 flex-1' },
          list: { className: 'max-h-60 overflow-auto p-1' },
          item: { className: 'flex min-h-10 cursor-pointer items-center rounded px-3 text-sm text-ink hover:bg-sage focus:bg-sage' },
        }}
      />
    </div>
  )
}
