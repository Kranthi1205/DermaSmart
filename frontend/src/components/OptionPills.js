import { jsx as _jsx } from "react/jsx-runtime";
export default function OptionPills({ options, value, onChange }) {
    return (_jsx("div", { role: "radiogroup", className: "flex gap-2 flex-wrap", children: options.map(opt => (_jsx("button", { role: "radio", "aria-checked": value === opt, onClick: () => onChange(opt), className: `px-3 py-1 rounded-full border ${value === opt ? 'bg-primary text-white' : 'bg-white'}`, children: opt }, opt))) }));
}
