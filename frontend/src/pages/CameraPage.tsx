import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { Camera as CameraIcon, RefreshCcw, CheckCircle2, AlertCircle, Upload, ImageIcon } from 'lucide-react'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Stepper } from '@/components/Stepper'
import { Button } from '@/components/ui/button'
import { validateFace } from '@/lib/api'

export default function CameraPage() {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot()
    if (src) {
      setImageSrc(src)
      setSelectedFile(null)
      setValidationError(null)
    }
  }, [webcamRef])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setValidationError("Please select a valid image file (JPEG, PNG, or WEBP).")
      return
    }

    setSelectedFile(file)
    setValidationError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const retake = () => {
    setImageSrc(null)
    setSelectedFile(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleContinue = async () => {
    if (!imageSrc) return

    setIsValidating(true)
    setValidationError(null)

    try {
      let file: File
      if (selectedFile) {
        file = selectedFile
      } else {
        const res = await fetch(imageSrc)
        const blob = await res.blob()
        file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      }

      const validation = await validateFace(file)

      if (validation.valid) {
        navigate('/form', { state: file })
      } else {
        setValidationError(validation.reason || "Validation failed. Please ensure your face is clearly visible.")
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
            <h1 className="text-3xl font-serif font-bold">Capture or Upload Photo</h1>
            <p className="text-muted-foreground max-w-md">
              Center your face with good lighting, or upload a clear photo from your device.
            </p>
          </div>

          <div className="w-full max-w-xl aspect-[4/3] relative rounded-2xl overflow-hidden bg-black border-4 border-muted flex items-center justify-center">
            {imageSrc ? (
              <img src={imageSrc} alt="Selected preview" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-muted/10 text-muted-foreground">
                <ImageIcon className="w-14 h-14 mb-3 opacity-40" />
                <h3 className="font-semibold text-lg text-foreground mb-1">Camera Unavailable</h3>
                <p className="text-sm max-w-sm mb-4">
                  We couldn't access a webcam. You can upload a photo from your computer or phone instead.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} className="rounded-full">
                  <Upload className="w-4 h-4 mr-2" /> Upload Photo
                </Button>
              </div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={true}
                forceScreenshotSourceSize={true}
                onUserMediaError={() => setCameraError(true)}
                videoConstraints={{
                  width: { ideal: 720 },
                  height: { ideal: 720 },
                  facingMode: "user"
                }}
                className="w-full h-full object-cover"
              />
            )}

            {/* Guide overlay for live webcam */}
            {!imageSrc && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/5 h-4/5 rounded-[100%] border-2 border-white/50 border-dashed" />
              </div>
            )}
            
            {/* Status chip */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full flex items-center shadow-sm">
              {imageSrc ? (
                selectedFile ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1 text-primary" /> Uploaded</>
                ) : (
                  <><CheckCircle2 className="w-3 h-3 mr-1 text-primary" /> Captured</>
                )
              ) : cameraError ? (
                <><AlertCircle className="w-3 h-3 mr-1 text-destructive" /> No Camera</>
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

          {/* Hidden file input for device upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload-input"
          />

          <div className="flex flex-col items-center gap-4 w-full">
            {!imageSrc ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
                {!cameraError && (
                  <Button size="lg" onClick={capture} className="rounded-full w-full sm:w-48 h-12 shadow-md">
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                )}
                {!cameraError && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or</span>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full w-full sm:w-48 h-12 shadow-sm border-input hover:bg-accent"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 w-full max-w-xl">
                <Button variant="outline" size="lg" onClick={retake} className="flex-1 rounded-full h-12" disabled={isValidating}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {selectedFile ? "Choose Another" : "Retake"}
                </Button>
                <Button size="lg" onClick={handleContinue} className="flex-1 rounded-full h-12" disabled={isValidating}>
                  {isValidating ? "Validating Photo..." : "Continue"}
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
