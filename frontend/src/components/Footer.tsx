export function Footer() {
  return (
    <footer className="border-t border-[#352f2a] py-6 md:py-0 mt-8 bg-[#1a1814]/80">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center text-xs leading-relaxed text-[#8c827a] md:text-left">
          <p className="max-w-2xl font-light">
            <strong className="font-medium text-[#f5f0eb]">Medical Disclaimer:</strong> DermaSmart is an AI-powered educational tool and does not provide medical advice. Always consult a certified dermatologist.
          </p>
        </div>
        <p className="text-xs font-mono text-[#8c827a]">
          Built by <span className="text-[#e53935] font-medium">Kranthi Kumar</span>
        </p>
      </div>
    </footer>
  )
}
