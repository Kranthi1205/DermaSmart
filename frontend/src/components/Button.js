import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ variant = 'primary', className = '', ...props }) {
    const base = 'px-4 py-2 rounded focus:outline-none';
    const variantClass = variant === 'primary' ? 'bg-primary text-white' : variant === 'danger' ? 'bg-danger text-white' : 'bg-white border';
    return _jsx("button", { className: `${base} ${variantClass} ${className}`, ...props });
}
