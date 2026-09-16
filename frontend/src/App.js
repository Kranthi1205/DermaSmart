import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import FormPage from './pages/FormPage';
import ReportPage from './pages/ReportPage';
import Nav from './components/Nav';
import Footer from './components/Footer';
export default function App() {
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(Nav, {}), _jsx("div", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(HomePage, {}) }), _jsx(Route, { path: '/camera', element: _jsx(CameraPage, {}) }), _jsx(Route, { path: '/form', element: _jsx(FormPage, {}) }), _jsx(Route, { path: '/report', element: _jsx(ReportPage, {}) })] }) }), _jsx(Footer, {})] }));
}
