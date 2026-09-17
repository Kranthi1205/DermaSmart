import { cn } from "@/lib/utils"

interface OptionPillsProps {
  options: string[]
  value: string
  onChange: (val: string) => void
}

export function OptionPills({ options, value, onChange }: OptionPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
