import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function ReviewQueue() {
    return (_jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 mb-2", children: "Review Queue" }), _jsx("p", { className: "text-sm text-gray-500 mb-6", children: "Use the Hiring Board to manage candidates." }), _jsx(Link, { to: "/pipeline", className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: "Go to Hiring Board" })] }) }));
}
