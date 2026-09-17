import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Stepper } from '@/components/Stepper'
import { OptionPills } from '@/components/OptionPills'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/Loader'
import { analyzeSkin } from '@/lib/api'

const OPTIONS = ["Not at all", "Unlikely", "Somewhat", "Likely", "Definitely"]

export default function FormPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isOily, setIsOily] = useState("Not at all")
  const [isDry, setIsDry] = useState("Not at all")
  const [isIntensive, setIsIntensive] = useState("Not at all")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const imageFile = location.state as File | null

  // Guard: if no file, must go back
  if (!imageFile) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">No photo found</h2>
          <p className="text-muted-foreground mb-6">Please take a photo first to analyze your skin.</p>
          <Button onClick={() => navigate('/camera')}>Go to Camera</Button>
        </main>
      </div>
    )
  }

  const skinType = useMemo(() => {
    if (isOily === "Likely" || isOily === "Definitely") return "Oily"
    if (isDry === "Likely" || isDry === "Definitely") return "Dry"
    return "Combination"
  }, [isOily, isDry])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)
    setLoadingMsgIdx(0)

    try {
      const res = await analyzeSkin({
        image: imageFile,
        skinType,
      })
      navigate('/report', { state: { responseData: res } })
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze skin. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Loading messages rotation
  useEffect(() => {
    if (!isSubmitting) return
    const messages = ["Checking image quality...", "Classifying skin condition...", "Generating routine..."]
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % messages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isSubmitting])

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      {isSubmitting && <Loader message={["Checking image quality...", "Classifying skin condition...", "Generating routine..."][loadingMsgIdx]} />}
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 relative">
        <Stepper currentStep={2} />

        <div className="space-y-8 pb-20">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold">Skin Profile</h1>
            <p className="text-muted-foreground">Answer a few quick questions to personalize your routine.</p>
          </div>

          <div className="flex justify-center">
            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20">
              Detected Skin Type: <span className="font-bold">{skinType}</span>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">How oily does your skin feel throughout the day?</CardTitle>
              </CardHeader>
              <CardContent>
                <OptionPills options={OPTIONS} value={isOily} onChange={setIsOily} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">How dry or tight does your skin feel?</CardTitle>
              </CardHeader>
              <CardContent>
                <OptionPills options={OPTIONS} value={isDry} onChange={setIsDry} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">How intensive is your current skincare routine?</CardTitle>
              </CardHeader>
              <CardContent>
                <OptionPills options={OPTIONS} value={isIntensive} onChange={setIsIntensive} />
              </CardContent>
            </Card>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Sticky bottom bar for submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t sm:static sm:bg-transparent sm:border-none sm:p-0 flex justify-end">
          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto rounded-full px-8 h-12 text-md">
            Analyze Skin
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
