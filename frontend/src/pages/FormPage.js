import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeSkin } from '../lib/api';
import OptionPills from '../components/OptionPills';
import Stepper from '../components/Stepper';
export default function FormPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const file = location.state;
    const [isOily, setIsOily] = useState('Not at all');
    const [isDry, setIsDry] = useState('Not at all');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    if (!file) {
        return (_jsxs("main", { className: "p-6", children: [_jsx("p", { children: "No image provided. Please start at the camera." }), _jsx("button", { className: "mt-4 px-4 py-2 bg-primary text-white rounded", onClick: () => navigate('/camera'), children: "Back to Camera" })] }));
    }
    const options = ['Not at all', 'Unlikely', 'Somewhat', 'Likely', 'Definitely'];
    const detectSkinType = () => {
        if (isOily === 'Likely' || isOily === 'Definitely')
            return 'Oily';
        if (isDry === 'Likely' || isDry === 'Definitely')
            return 'Dry';
        return 'Combination';
    };
    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await analyzeSkin({ image: file, skinType: detectSkinType() });
            navigate('/report', { state: res });
        }
        catch (e) {
            setError(e.message || 'Submission failed');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("main", { className: "p-6 max-w-2xl mx-auto", children: [_jsx(Stepper, { step: 2 }), _jsx("h2", { className: "text-xl font-semibold", children: "Skin Questionnaire" }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block font-medium", children: "How oily does your skin feel?" }), _jsx("div", { className: "mt-2", children: _jsx(OptionPills, { options: options, value: isOily, onChange: setIsOily }) })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block font-medium", children: "How dry or tight does your skin feel?" }), _jsx("div", { className: "mt-2", children: _jsx(OptionPills, { options: options, value: isDry, onChange: setIsDry }) })] }), _jsxs("div", { className: "mt-6 flex flex-col md:flex-row md:items-center md:gap-3", children: [_jsx("button", { className: "px-4 py-2 bg-primary text-white rounded", onClick: submit, disabled: submitting, "aria-busy": submitting, children: submitting ? 'Submitting...' : 'Submit' }), _jsxs("div", { className: "py-2", children: ["Detected skin type: ", _jsx("strong", { children: detectSkinType() })] })] }), error && _jsx("div", { className: "mt-4 text-red-600", children: error })] }));
}
