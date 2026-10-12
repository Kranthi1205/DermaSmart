import { ValidateFaceResponse } from "../types/api"

// Photo pre-check that runs entirely in the browser. It used to be a round
// trip to /validate-face, which meant the camera step waited on the backend —
// and on a sleeping instance that wait ran to minutes. The checks mirror
// validate_face() in backend/aiModel.py, and /userInfo still screens the image
// before inference, so nothing is lost by doing this locally.

const SAMPLE_SIZE = 224
const MIN_VARIANCE = 150
// The backend asks for 35% skin, but only as a fallback after its face
// detector has missed. Without that detector here, a face framed with some
// background routinely lands below 35%, so the bar is set to reject photos
// with almost no skin rather than ordinary selfies.
const MIN_SKIN_PERCENT = 15

// Shape detection API — present in some Chromium builds, absent elsewhere.
interface FaceDetectorLike {
  detect(image: ImageBitmapSource): Promise<unknown[]>
}
type FaceDetectorCtor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Could not read the image."))
    img.src = src
  })
}

// Same ranges as the backend's cv2.inRange on 8-bit HSV:
// H 0–20 (of 0–179), S 20–255, V 70–255.
function isSkinPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (max < 70 || delta === 0) return false
  if ((delta / max) * 255 < 20) return false

  let hue: number
  if (max === r) hue = 60 * ((g - b) / delta)
  else if (max === g) hue = 120 + 60 * ((b - r) / delta)
  else hue = 240 + 60 * ((r - g) / delta)
  if (hue < 0) hue += 360

  return hue / 2 <= 20
}

async function detectFace(img: HTMLImageElement): Promise<boolean> {
  const Ctor = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector
  if (!Ctor) return false
  try {
    const faces = await new Ctor({ fastMode: true, maxDetectedFaces: 1 }).detect(img)
    return faces.length > 0
  } catch {
    return false
  }
}

export async function validateImage(src: string): Promise<ValidateFaceResponse> {
  try {
    const img = await loadImage(src)

    const canvas = document.createElement("canvas")
    canvas.width = SAMPLE_SIZE
    canvas.height = SAMPLE_SIZE
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return { valid: true }
    ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

    let sum = 0
    let sumSq = 0
    let skin = 0
    const pixels = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      sum += r + g + b
      sumSq += r * r + g * g + b * b
      if (isSkinPixel(r, g, b)) skin++
    }
    const n = pixels * 3
    const variance = sumSq / n - (sum / n) ** 2

    if (variance < MIN_VARIANCE) {
      return {
        valid: false,
        reason: "The image appears to be blank or too dark. Please ensure you are in a well-lit area and your face is visible.",
      }
    }

    if (await detectFace(img)) return { valid: true }

    const skinPercent = (skin / pixels) * 100
    if (skinPercent >= MIN_SKIN_PERCENT) return { valid: true }

    return {
      valid: false,
      reason: `No face detected (${skinPercent.toFixed(0)}% skin visible). Please position your face clearly in the frame.`,
    }
  } catch {
    // A pre-check that cannot run should not block the user; the backend
    // screens the image again before analysis.
    return { valid: true }
  }
}
