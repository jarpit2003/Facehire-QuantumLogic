import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, Users, Award, Target } from "lucide-react";
export default function MetricsCards({ totalCandidates, averageFitScore, topCandidateScore, interviewReadyCount, }) {
    const metrics = [
        {
            label: "Total Applicants",
            value: totalCandidates.toString(),
            sub: "in this pipeline run",
            icon: Users,
            accent: "border-blue-500",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            valueColor: "text-slate-900",
        },
        {
            label: "Avg. Fit Score",
            value: `${averageFitScore.toFixed(1)}%`,
            sub: "across all profiles",
            icon: TrendingUp,
            accent: averageFitScore >= 60 ? "border-emerald-500" : "border-amber-400",
            iconBg: averageFitScore >= 60 ? "bg-emerald-50" : "bg-amber-50",
            iconColor: averageFitScore >= 60 ? "text-emerald-600" : "text-amber-600",
            valueColor: averageFitScore >= 60 ? "text-emerald-700" : "text-amber-700",
        },
        {
            label: "Top Match Score",
            value: `${topCandidateScore}%`,
            sub: "best candidate strength",
            icon: Award,
            accent: topCandidateScore >= 80 ? "border-emerald-500" : "border-blue-400",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            valueColor: "text-slate-900",
        },
        {
            label: "Interview Ready",
            value: interviewReadyCount.toString(),
            sub: `of ${totalCandidates} candidates`,
            icon: Target,
            accent: "border-emerald-500",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            valueColor: "text-emerald-700",
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: metrics.map((m) => (_jsxs("div", { className: `bg-white rounded-2xl border border-gray-100 shadow-card p-5 border-l-4 ${m.accent} flex items-center gap-4`, children: [_jsx("div", { className: `${m.iconBg} rounded-xl p-3 flex-shrink-0`, children: _jsx(m.icon, { className: `h-5 w-5 ${m.iconColor}` }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide truncate", children: m.label }), _jsx("p", { className: `text-2xl font-bold tracking-tight mt-0.5 ${m.valueColor}`, children: m.value }), _jsx("p", { className: "text-xs text-gray-400 mt-0.5 truncate", children: m.sub })] })] }, m.label))) }));
}
