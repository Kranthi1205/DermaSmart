import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export default function HomePage() {
    const navigate = useNavigate();
    return (_jsxs("main", { className: "p-6 max-w-4xl mx-auto", children: [_jsxs("header", { className: "py-8 text-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "DermaSmart \u2014 AI Skin Analysis" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Quick, non-diagnostic skin intelligence." }), _jsx("div", { className: "mt-6", children: _jsx("button", { className: "px-6 py-3 bg-primary text-white rounded-md", onClick: () => navigate('/camera'), children: "Begin Analysis" }) })] }), _jsxs("section", { className: "grid gap-4 md:grid-cols-3", children: [_jsx("div", { className: "p-4 bg-white rounded shadow", children: "Image gating" }), _jsx("div", { className: "p-4 bg-white rounded shadow", children: "Ethical safety intercept" }), _jsx("div", { className: "p-4 bg-white rounded shadow", children: "AI routine" })] })] }));
}
