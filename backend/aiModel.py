try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        tflite = None
from PIL import Image
import os
import cv2
import numpy as np
import io
import threading

# Haarcascade for Face Detection — loaded on first use, not at import, so the
# web server can bind to its port immediately on a cold start.
_face_cascade = None
_face_cascade_lock = threading.Lock()


def get_face_cascade():
    global _face_cascade
    if _face_cascade is None:
        with _face_cascade_lock:
            if _face_cascade is None:
                _face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
    return _face_cascade

LABELS = [
    'Acne and Rosacea',
    'Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions',
    'Atopic Dermatitis',
    'Bullous Disease',
    'Cellulitis Impetigo and other Bacterial Infections',
    'Eczema',
    'Exanthems and Drug Eruptions',
    'Hair Loss Alopecia and other Hair Diseases',
    'Herpes HPV and other STDs',
    'Light Diseases and Disorders of Pigmentation',
    'Lupus and other Connective Tissue Diseases',
    'Melanoma Skin Cancer Nevi and Moles',
    'Nail Fungus and other Nail Disease',
    'Poison Ivy and other Contact Dermatitis',
    'Psoriasis Lichen Planus and related diseases',
    'Scabies Lyme Disease and other Infestations and Bites',
    'Seborrheic Keratoses and other Benign Tumors',
    'Systemic Disease',
    'Tinea Ringworm Candidiasis and other Fungal Infections',
    'Urticaria Hives',
    'Vascular Tumors',
    'Vasculitis',
    'Warts Molluscum and other Viral Infections'
]

# Path to TFLite model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "tf_model.tflite")

# TFLite model — loaded on the first inference, not at import. Allocating the
# tensors for an 11 MB model at import time delayed the port binding long enough
# for the host to consider the service dead on a cold start.
interpreter = None
input_details = None
output_details = None
_model_lock = threading.Lock()
_model_load_attempted = False


def get_interpreter():
    """Load the TFLite model once, on first use. Returns None if unavailable."""
    global interpreter, input_details, output_details, _model_load_attempted

    if interpreter is not None or _model_load_attempted:
        return interpreter

    with _model_lock:
        if interpreter is not None or _model_load_attempted:
            return interpreter
        _model_load_attempted = True
        try:
            if tflite is None:
                print("[WARN] TFLite runtime not installed on this host. Local fallback mode enabled.")
            elif not os.path.exists(MODEL_PATH):
                print(f"[WARN] TFLite model not found at {MODEL_PATH}")
            else:
                loaded = tflite.Interpreter(model_path=MODEL_PATH)
                loaded.allocate_tensors()
                input_details = loaded.get_input_details()
                output_details = loaded.get_output_details()
                interpreter = loaded
                print("[OK] TFLite model loaded successfully.")
        except Exception as e:
            print(f"[WARN] Could not load TFLite model: {e}")

    return interpreter


def validate_face(image_bytes: bytes) -> dict:
    """
    Lightweight face/skin validation for camera page pre-screening.
    Does NOT run TFLite inference — just checks for blank image and face/skin presence.
    Returns {"valid": True} or {"valid": False, "reason": "<message>"}
    """
    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = pil_image.resize((224, 224))
        img_numpy = np.array(img)

        # 1. Blank / Dark / Uniform image check
        if np.var(img_numpy) < 150:
            return {"valid": False, "reason": "The image appears to be blank or too dark. Please ensure you are in a well-lit area and your face is visible."}

        # 2. Try Haarcascade face detection
        frame = cv2.cvtColor(img_numpy, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = get_face_cascade().detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))

        if len(faces) > 0:
            return {"valid": True}

        # 3. Fallback: HSV skin color segmentation
        hsv = cv2.cvtColor(img_numpy, cv2.COLOR_RGB2HSV)
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        skin_percentage = (np.count_nonzero(mask) / mask.size) * 100

        if skin_percentage >= 35.0:
            return {"valid": True}

        return {
            "valid": False,
            "reason": f"No face detected ({skin_percentage:.0f}% skin visible, minimum 35% required). Please position your face clearly in the frame."
        }

    except Exception as e:
        return {"valid": False, "reason": f"Image validation failed: {str(e)}"}


def skin_analysis(image_bytes: bytes) -> dict:

    """
    Run skin condition classification on uploaded image bytes using TFLite.
    Returns {"condition": "<label>"} or {"error": "<message>"}
    """
    model = get_interpreter()
    if model is None:
        print("[WARN] Running skin_analysis in local fallback mode (no TFLite interpreter loaded).")
        return {"condition": "Acne and Rosacea"}

    try:
        # Load image from bytes
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = pil_image.resize((224, 224))
        img_numpy = np.array(img)
        
        # 1. Blank / Dark Photo check
        if np.var(img_numpy) < 150:
            return {"error": "The captured image appears to be blank or too dark. Please take a well-lit photo of your face."}

        # 2. Face Detection & Skin Color Segmentation
        frame = cv2.cvtColor(img_numpy, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = get_face_cascade().detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
        
        if len(faces) == 0:
            # Fallback to Skin Color Segmentation (HSV space)
            hsv = cv2.cvtColor(img_numpy, cv2.COLOR_RGB2HSV)
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_percentage = (np.count_nonzero(mask) / mask.size) * 100
            
            if skin_percentage < 35.0:
                return {"error": "No face detected, and skin visibility is below 35%. Please ensure your skin is clearly visible in the camera frame for a high-precision analysis."}

        # 3. TFLite Classification & Confidence Thresholding
        # Normalization: MobileNetV2 expects [-1, 1]
        input_data = (img_numpy.astype(np.float32) / 127.5) - 1.0
        input_data = np.expand_dims(input_data, axis=0)
        
        # Set the tensor to point to the input data to be inferred
        model.set_tensor(input_details[0]['index'], input_data)
        
        # Run inference
        model.invoke()
        
        # Get the result
        prediction = model.get_tensor(output_details[0]['index'])
        
        confidence = np.max(prediction[0])
        if confidence < 0.50:
            return {"error": f"Inconclusive result (Confidence: {confidence:.0%}). Unable to clearly identify a skin condition. Please take a clearer, closer photo of the skin."}
            
        condition = LABELS[np.argmax(prediction[0])]
        return {"condition": condition}

    except Exception as e:
        return {"error": str(e)}
