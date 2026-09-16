import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { validateFace } from '../lib/api';
import Stepper from '../components/Stepper';
export default function CameraPage() {
    const webcamRef = useRef(null);
    const [captured, setCaptured] = useState(null);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const capture = () => {
        const img = webcamRef.current?.getScreenshot();
        setCaptured(img || null);
    };
    const continueWithCapture = async () => {
        if (!captured)
            return;
        setValidating(true);
        setError(null);
        try {
            const blob = await (await fetch(captured)).blob();
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            const res = await validateFace(file);
            if (res.valid) {
                navigate('/form', { state: file });
            }
            else {
                setError(res.reason || 'Validation failed');
            }
        }
        catch (e) {
            setError('Could not connect to validation server. Please check your connection.');
        }
        finally {
            setValidating(false);
        }
    };
    return (_jsxs("main", { className: "p-6 max-w-3xl mx-auto", children: [_jsx(Stepper, { step: 1 }), _jsx("h2", { className: "text-xl font-semibold mb-4", children: "Camera" }), !captured ? (_jsx("div", { className: "bg-black rounded-md overflow-hidden", "aria-live": "polite", children: _jsx(Webcam, { audio: false, mirrored: true, forceScreenshotSourceSize: true, screenshotFormat: "image/jpeg", videoConstraints: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' }, ref: webcamRef }) })) : (_jsx("img", { src: captured, className: "rounded-md", alt: "Captured selfie" })), _jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx("button", { className: "px-4 py-2 bg-primary text-white rounded", onClick: capture, children: "Capture" }), captured && _jsx("button", { className: "px-4 py-2 bg-white border rounded", onClick: () => setCaptured(null), children: "Retake" }), captured && _jsx("button", { className: "px-4 py-2 bg-accent text-white rounded", onClick: continueWithCapture, disabled: validating, children: validating ? 'Checking...' : 'Continue' })] }), error && _jsx("div", { role: "alert", className: "mt-4 text-red-600", children: error })] }));
}
