import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart as PieChartIcon } from 'lucide-react';
const ROWS = [
    {
        key: 'interview',
        label: 'Interview Ready',
        color: '#10B981',
        track: 'bg-green-100',
        description: 'Ready for immediate interviews',
    },
    {
        key: 'shortlisted',
        label: 'Shortlisted',
        color: '#F59E0B',
        track: 'bg-amber-100',
        description: 'Strong contenders',
    },
    {
        key: 'consider',
        label: 'Consider',
        color: '#fbbf24',
        track: 'bg-amber-50',
        description: 'May need additional screening',
    },
    {
        key: 'reject',
        label: 'Reject',
        color: '#EF4444',
        track: 'bg-red-50',
        description: 'Not suitable for this role',
    },
];
export default function RecommendationFunnel({ breakdown }) {
    const enriched = ROWS.map((row) => ({
        ...row,
        value: breakdown[row.key] ?? 0,
    })).filter((row) => row.value > 0);
    const total = enriched.reduce((sum, row) => sum + row.value, 0);
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6", children: [_jsxs("div", { className: "flex items-start gap-3 mb-6", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-2.5 flex-shrink-0", children: _jsx(PieChartIcon, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "Recommendation Breakdown" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Share of candidates by AI recommendation tier" })] })] }), enriched.length === 0 ? (_jsx("div", { className: "text-center py-10 text-sm text-gray-500", children: "No recommendation data for this pool" })) : (_jsx("div", { className: "space-y-5", children: enriched.map((row) => {
                    const pct = total > 0 ? Math.round((row.value / total) * 1000) / 10 : 0;
                    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-semibold text-gray-900", children: row.label }), _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: row.description })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("span", { className: "text-sm font-bold text-gray-900", children: row.value }), _jsxs("span", { className: "text-xs text-gray-500 ml-2", children: [pct, "%"] })] })] }), _jsx("div", { className: `h-2.5 w-full rounded-full overflow-hidden ${row.track}`, children: _jsx("div", { className: "h-full rounded-full transition-all", style: {
                                        width: `${pct}%`,
                                        backgroundColor: row.color,
                                        minWidth: pct > 0 ? '4px' : undefined,
                                    } }) })] }, row.key));
                }) }))] }));
}
