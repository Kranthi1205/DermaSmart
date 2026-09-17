import { cn } from "@/lib/utils"

interface StepperProps {
  currentStep: number // 1, 2, or 3
}

export function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { num: 1, label: "Scan" },
    { num: 2, label: "Questions" },
    { num: 3, label: "Report" },
  ]

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
              currentStep === step.num
                ? "border-primary bg-primary text-primary-foreground"
                : currentStep > step.num
                ? "border-primary text-primary"
                : "border-muted text-muted-foreground"
            )}
          >
            {step.num}
          </div>
          <span
            className={cn(
              "ml-2 text-sm font-medium hidden sm:block",
              currentStep === step.num
                ? "text-foreground"
                : currentStep > step.num
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "ml-4 h-0.5 w-8 sm:w-12",
                currentStep > step.num ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
