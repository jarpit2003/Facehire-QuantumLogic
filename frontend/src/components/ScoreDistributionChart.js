import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
export default function ScoreDistributionChart({ distribution }) {
    const data = [
        {
            category: 'Excellent',
            range: '80-100%',
            count: distribution.excellent,
            color: '#10B981',
        },
        {
            category: 'Good',
            range: '60-79%',
            count: distribution.good,
            color: '#2563EB',
        },
        {
            category: 'Moderate',
            range: '40-59%',
            count: distribution.moderate,
            color: '#F59E0B',
        },
        {
            category: 'Poor',
            range: '0-39%',
            count: distribution.poor,
            color: '#EF4444',
        },
    ];
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const row = payload[0].payload;
            return (_jsxs("div", { className: "bg-white p-3 border border-gray-100 rounded-xl shadow-card", children: [_jsx("p", { className: "font-semibold text-gray-900", children: `${label} (${row.range})` }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: `Candidates: ${row.count}` })] }));
        }
        return null;
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6", children: [_jsxs("div", { className: "flex items-start gap-3 mb-6", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-2.5 flex-shrink-0", children: _jsx(BarChart3, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "Score Distribution" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "How candidates cluster across fit score bands" })] })] }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 12, right: 24, left: 8, bottom: 8 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", vertical: false }), _jsx(XAxis, { dataKey: "category", tick: { fontSize: 12, fill: '#6b7280' }, tickLine: false, axisLine: false }), _jsx(YAxis, { tick: { fontSize: 12, fill: '#6b7280' }, tickLine: false, axisLine: false }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}), cursor: { fill: 'rgba(37, 99, 235, 0.06)' } }), _jsx(Bar, { dataKey: "count", radius: [8, 8, 0, 0], maxBarSize: 56, children: data.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) })] }) }) })] }));
}
