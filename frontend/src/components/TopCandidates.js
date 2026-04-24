import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Award, LayoutList, CalendarPlus } from "lucide-react";
export default function TopCandidates({ candidates }) {
    const navigate = useNavigate();
    const handleProceedInterview = (candidate) => {
        const row = {
            id: candidate.id,
            name: candidate.name,
            fitScore: candidate.fitScore,
            matchedSkills: candidate.matchedSkills,
            recommendation: candidate.recommendation,
        };
        navigate("/interviews", { state: { candidate: row } });
    };
    const getRankIcon = (index) => {
        switch (index) {
            case 0: return _jsx(Trophy, { className: "h-5 w-5 text-amber-500" });
            case 1: return _jsx(Medal, { className: "h-5 w-5 text-gray-400" });
            case 2: return _jsx(Award, { className: "h-5 w-5 text-amber-600" });
            default: return _jsxs("span", { className: "text-sm font-semibold text-gray-500", children: ["#", index + 1] });
        }
    };
    const getRecommendationBadge = (recommendation) => {
        const styles = {
            interview: "bg-green-100 text-green-800 border border-green-200",
            shortlisted: "bg-amber-50 text-amber-800 border border-amber-200",
            consider: "bg-amber-50 text-amber-700 border border-amber-200",
            reject: "bg-red-100 text-red-800 border border-red-200",
        };
        return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[recommendation] ?? "bg-gray-100 text-gray-800 border border-gray-200"}`, children: recommendation.charAt(0).toUpperCase() + recommendation.slice(1) }));
    };
    const getScoreBadgeClass = (score) => {
        if (score >= 80)
            return "bg-green-100 text-green-800 border border-green-200";
        if (score >= 60)
            return "bg-blue-100 text-blue-800 border border-blue-200";
        if (score >= 40)
            return "bg-amber-50 text-amber-800 border border-amber-200";
        return "bg-red-100 text-red-800 border border-red-200";
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-6 py-5 border-b border-gray-100 flex items-start gap-3", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-2.5 flex-shrink-0", children: _jsx(LayoutList, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "Top Candidates Leaderboard" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Ranked by AI fit score and role alignment" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-slate-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Rank" }), _jsx("th", { className: "px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Candidate" }), _jsx("th", { className: "px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Fit Score" }), _jsx("th", { className: "px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Top Skills" }), _jsx("th", { className: "px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Recommendation" }), _jsx("th", { className: "px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Next step" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: candidates.map((candidate, index) => (_jsxs("tr", { className: index % 2 === 1 ? "bg-slate-50/80" : "bg-white", children: [_jsx("td", { className: "px-4 sm:px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "flex items-center", children: getRankIcon(index) }) }), _jsxs("td", { className: "px-4 sm:px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-semibold text-gray-900", children: candidate.name }), _jsx("div", { className: "text-sm text-gray-500", children: candidate.id })] }), _jsx("td", { className: "px-4 sm:px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadgeClass(candidate.fitScore)}`, children: [candidate.fitScore, "%"] }) }), _jsx("td", { className: "px-4 sm:px-6 py-4", children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [candidate.matchedSkills.slice(0, 3).map((skill) => (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800", children: skill }, skill))), candidate.matchedSkills.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500 self-center", children: ["+", candidate.matchedSkills.length - 3, " more"] }))] }) }), _jsx("td", { className: "px-4 sm:px-6 py-4 whitespace-nowrap", children: getRecommendationBadge(candidate.recommendation) }), _jsx("td", { className: "px-4 sm:px-6 py-4 whitespace-nowrap text-right", children: _jsxs("button", { type: "button", onClick: () => handleProceedInterview(candidate), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100", children: [_jsx(CalendarPlus, { className: "h-4 w-4 flex-shrink-0" }), "Proceed to Interview"] }) })] }, candidate.id))) })] }) })] }));
}
