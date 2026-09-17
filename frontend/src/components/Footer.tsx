export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 mt-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          <p className="max-w-2xl text-xs sm:text-sm">
            <strong className="font-semibold text-foreground">Medical Disclaimer:</strong> DermaSmart is an AI-powered educational tool and does not provide medical advice. Results are not a substitute for professional diagnosis or treatment. Always consult a certified dermatologist.
          </p>
        </div>
      </div>
    </footer>
  )
}
