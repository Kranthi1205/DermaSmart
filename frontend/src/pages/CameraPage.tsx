import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { Camera as CameraIcon, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Stepper } from '@/components/Stepper'
import { Button } from '@/components/ui/button'
import { validateFace } from '@/lib/api'

export default function CameraPage() {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)
  
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot()
    if (src) {
      setImageSrc(src)
      setValidationError(null)
    }
  }, [webcamRef])

  const retake = () => {
    setImageSrc(null)
    setValidationError(null)
  }

  const handleContinue = async () => {
    if (!imageSrc) return

    setIsValidating(true)
    setValidationError(null)

    try {
      // Convert dataUrl to File
      const res = await fetch(imageSrc)
      const blob = await res.blob()
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })

      const validation = await validateFace(file)

      if (validation.valid) {
        navigate('/form', { state: file })
      } else {
        setValidationError(validation.reason || "Validation failed.")
      }
    } catch (err) {
      setValidationError("Could not connect to validation server. Please check your connection.")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <Stepper currentStep={1} />
        
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold">Capture Photo</h1>
            <p className="text-muted-foreground max-w-md">
              Center your face in the oval. Ensure good lighting and remove any glasses or masks.
            </p>
          </div>

          <div className="w-full max-w-xl aspect-[4/3] relative rounded-2xl overflow-hidden bg-black border-4 border-muted">
            {imageSrc ? (
              <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={true}
                forceScreenshotSourceSize={true}
                videoConstraints={{
                  width: { ideal: 720 },
                  height: { ideal: 720 },
                  facingMode: "user"
                }}
                className="w-full h-full object-cover"
              />
            )}

            {/* Guide overlay */}
            {!imageSrc && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/5 h-4/5 rounded-[100%] border-2 border-white/50 border-dashed" />
              </div>
            )}
            
            {/* Status chip */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full flex items-center">
              {imageSrc ? (
                <><CheckCircle2 className="w-3 h-3 mr-1 text-primary" /> Captured</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" /> Live</>
              )}
            </div>
          </div>

          {validationError && (
            <div className="w-full max-w-xl p-4 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center text-center space-y-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium text-sm" aria-live="assertive">{validationError}</span>
              </div>
              <Button variant="outline" size="sm" onClick={retake} className="w-fit border-destructive/20 hover:bg-destructive/10 text-destructive">
                Try Again
              </Button>
            </div>
          )}

          <div className="flex gap-4">
            {!imageSrc ? (
              <Button size="lg" onClick={capture} className="rounded-full w-48 h-12 shadow-md">
                <CameraIcon className="w-5 h-5 mr-2" />
                Capture
              </Button>
            ) : (
              <div className="flex gap-4 w-full max-w-xl">
                <Button variant="outline" size="lg" onClick={retake} className="flex-1 rounded-full h-12" disabled={isValidating}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button size="lg" onClick={handleContinue} className="flex-1 rounded-full h-12" disabled={isValidating}>
                  {isValidating ? "Checking..." : "Continue"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
