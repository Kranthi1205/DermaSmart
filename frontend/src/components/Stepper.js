import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Stepper({ step = 1 }) {
    const steps = ['Scan', 'Questions', 'Report'];
    return (_jsx("div", { className: "flex items-center gap-3", children: steps.map((s, i) => (_jsxs("div", { className: `flex items-center gap-2 ${i > 0 ? 'ml-2' : ''}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${i + 1 === step ? 'bg-primary text-white' : 'bg-white border'}`, children: i + 1 }), _jsx("div", { className: "hidden md:block text-sm", children: s })] }, s))) }));
}
