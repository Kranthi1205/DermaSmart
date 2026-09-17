import { Loader2 } from "lucide-react"

export function Loader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-foreground animate-pulse">{message}</p>
    </div>
  )
}
