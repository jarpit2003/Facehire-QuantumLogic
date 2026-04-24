import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Lightbulb, CheckCircle, AlertCircle, Info } from 'lucide-react';
export default function InsightsPanel({ insights }) {
    const getInsightIcon = (key) => {
        switch (key) {
            case 'quality':
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
            case 'readiness':
                return _jsx(Info, { className: "h-5 w-5 text-blue-600" });
            case 'skill_gaps':
                return _jsx(AlertCircle, { className: "h-5 w-5 text-amber-600" });
            case 'recommendation':
                return _jsx(Lightbulb, { className: "h-5 w-5 text-blue-600" });
            default:
                return _jsx(Info, { className: "h-5 w-5 text-gray-500" });
        }
    };
    const getInsightTitle = (key) => {
        switch (key) {
            case 'quality':
                return 'Candidate Pool Quality';
            case 'readiness':
                return 'Interview Readiness';
            case 'skill_gaps':
                return 'Skill Gap Analysis';
            case 'recommendation':
                return 'Recommended Action';
            default:
                return key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        }
    };
    const getInsightColor = (key) => {
        switch (key) {
            case 'quality':
                return 'border-green-200 bg-green-50';
            case 'readiness':
                return 'border-blue-200 bg-blue-50';
            case 'skill_gaps':
                return 'border-amber-200 bg-amber-50';
            case 'recommendation':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6", children: [_jsxs("div", { className: "flex items-start gap-3 mb-6", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-2.5 flex-shrink-0", children: _jsx(Lightbulb, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "AI Insights" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Narrative summary across your pipeline" })] })] }), _jsx("div", { className: "space-y-4", children: Object.entries(insights).map(([key, value]) => (_jsx("div", { className: `p-4 rounded-xl border ${getInsightColor(key)}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: getInsightIcon(key) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-1", children: getInsightTitle(key) }), _jsx("p", { className: "text-sm text-gray-700 leading-relaxed", children: value })] })] }) }, key))) })] }));
}
