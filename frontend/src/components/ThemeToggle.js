import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
    useEffect(() => {
        const root = document.documentElement;
        if (dark)
            root.classList.add('dark');
        else
            root.classList.remove('dark');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);
    return (_jsx("button", { "aria-pressed": dark, onClick: () => setDark(d => !d), className: "px-2 py-1 border rounded", children: dark ? 'Dark' : 'Light' }));
}
