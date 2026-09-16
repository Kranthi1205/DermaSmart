import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitFeedback } from '../lib/api';
import fallbackProducts from '../assets/Products.json';
import Stepper from '../components/Stepper';
export default function ReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [feedbackError, setFeedbackError] = useState(null);
    if (!data) {
        return (_jsxs("main", { className: "p-6", children: [_jsx("p", { children: "No report data. Start a new analysis." }), _jsx("button", { className: "mt-4 px-4 py-2 bg-primary text-white rounded", onClick: () => navigate('/camera'), children: "Start new analysis" })] }));
    }
    const report = data.dermaReport?.report;
    const isEmergency = !!data.is_emergency;
    const productsToShow = (report && report.products && report.products.length > 0) ? report.products : (!isEmergency ? fallbackProducts : []);
    const handleFeedback = async (isAcc) => {
        setSubmittingFeedback(true);
        setFeedbackError(null);
        try {
            await submitFeedback(data.analysis_id, isAcc, '');
            setFeedbackSent(true);
        }
        catch (e) {
            setFeedbackError(e.message || 'Feedback failed');
        }
        finally {
            setSubmittingFeedback(false);
        }
    };
    return (_jsxs("main", { className: "p-6 max-w-5xl mx-auto", children: [_jsx(Stepper, { step: 3 }), _jsxs("header", { className: "mb-4", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Skin Intelligence Report" }), _jsxs("div", { className: "text-slate-600", children: ["Condition: ", data.skin_condition, " \u2014 ", report?.overview?.condition] })] }), isEmergency && (_jsxs("div", { role: "alert", className: "mb-4 p-4 rounded bg-red-50 border-l-4 border-red-600 text-red-800", children: [_jsx("strong", { children: "EMERGENCY ALERT:" }), " High probability of a malignant lesion. Stop cosmetic routines and consult a certified dermatologist immediately."] })), _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsxs("section", { className: "md:col-span-2 bg-white p-4 rounded shadow", children: [_jsx("h3", { className: "font-semibold", children: "Routine" }), _jsxs("div", { className: "mt-2 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Morning" }), _jsx("ol", { className: "list-decimal ml-5", children: report?.routine?.morning?.map((s, i) => _jsx("li", { children: s }, i)) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Evening" }), _jsx("ol", { className: "list-decimal ml-5", children: report?.routine?.evening?.map((s, i) => _jsx("li", { children: s }, i)) })] })] })] }), _jsxs("aside", { className: "bg-white p-4 rounded shadow", children: [_jsx("h3", { className: "font-semibold", children: "Diet" }), _jsx("ul", { className: "list-disc ml-5", children: report?.diet?.recommendations?.map((r, i) => _jsx("li", { children: r }, i)) }), !isEmergency && (_jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-semibold", children: "Products" }), _jsx("div", { className: "mt-2 grid grid-cols-1 gap-3", children: productsToShow.map((p, idx) => (_jsxs("div", { className: "flex gap-3 items-center", children: [_jsx("img", { src: p.image, alt: p.name, className: "w-20 h-14 object-cover rounded", onError: (e) => { e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product'; } }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [p.name, " \u2014 $", p.price] }), _jsx("div", { className: "text-sm text-slate-600", children: p.description })] })] }, idx))) })] })), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-semibold", children: "Feedback" }), isEmergency ? _jsx("div", { className: "text-slate-600 text-sm mt-2", children: "Feedback disabled for emergency alerts." }) : (_jsxs("div", { className: "flex gap-2 mt-2", children: [_jsx("button", { className: "px-3 py-2 bg-primary text-white rounded", onClick: () => handleFeedback(true), disabled: submittingFeedback || feedbackSent, children: submittingFeedback ? 'Sending...' : feedbackSent ? 'Recorded' : 'Accurate' }), _jsx("button", { className: "px-3 py-2 bg-white border rounded", onClick: () => handleFeedback(false), disabled: submittingFeedback || feedbackSent, children: "Not accurate" })] })), feedbackError && _jsx("div", { className: "mt-2 text-red-600", children: feedbackError }), feedbackSent && _jsx("div", { className: "mt-2 text-green-600", children: "Feedback recorded. Thank you!" })] })] })] })] }));
}
