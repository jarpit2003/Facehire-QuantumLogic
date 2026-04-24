import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ArrowRight, UserCircle, Briefcase, Loader2, RefreshCw, FileStack } from "lucide-react";
import { applicationService } from "../services/api";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";
function scoreColor(s) {
    if (s >= 80)
        return "text-green-700 bg-green-50 border-green-200";
    if (s >= 60)
        return "text-blue-700 bg-blue-50 border-blue-200";
    if (s >= 40)
        return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
}
function stageBadge(stage) {
    const map = {
        applied: "bg-slate-100 text-slate-700",
        shortlisted: "bg-cyan-100 text-cyan-800",
        test_sent: "bg-sky-100 text-sky-800",
        tested: "bg-blue-100 text-blue-800",
        interview_1: "bg-amber-100 text-amber-800",
        interview_2: "bg-purple-100 text-purple-800",
        offered: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-700",
    };
    return map[stage] ?? "bg-gray-100 text-gray-700";
}
function stageLabel(stage) {
    const map = {
        applied: "Applied", shortlisted: "Shortlisted", test_sent: "Test Sent", tested: "Assessment",
        interview_1: "Round 1", interview_2: "Round 2", offered: "Offered", rejected: "Rejected",
    };
    return map[stage] ?? stage;
}
export default function Candidates() {
    const { activeJob } = useJobs();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!activeJob)
            return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await applicationService.list(activeJob.id);
            setApplications(data);
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to load candidates"));
        }
        finally {
            setLoading(false);
        }
    }, [activeJob]);
    useEffect(() => { load(); }, [load]);
    if (!activeJob) {
        return (_jsx("div", { className: "max-w-lg mx-auto mt-16 text-center", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10", children: [_jsx(Briefcase, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "No active job" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Select a job from the sidebar to view its candidates." })] }) }));
    }
    if (loading && applications.length === 0) {
        return (_jsx("div", { className: "flex justify-center py-24", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) }));
    }
    if (applications.length === 0) {
        return (_jsx("div", { className: "max-w-lg mx-auto mt-8 text-center", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10", children: [_jsx(Users, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "No candidates yet" }), _jsxs("p", { className: "mt-2 text-sm text-gray-500", children: ["Upload resumes to start scoring candidates for ", _jsx("strong", { children: activeJob.title }), "."] }), _jsxs(Link, { to: "/process-resumes", className: "mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: [_jsx(FileStack, { className: "h-4 w-4" }), " Upload Resumes ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] }) }));
    }
    const sorted = [...applications].sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-3 flex-shrink-0", children: _jsx(Users, { className: "h-7 w-7 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Candidates" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [sorted.length, " applicants for ", _jsx("strong", { children: activeJob.title }), " \u00B7 sorted by AI score"] })] })] }), _jsxs("button", { onClick: load, disabled: loading, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), " Refresh"] })] }) }), error && _jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: error }), _jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-100", children: [_jsx("thead", { className: "bg-slate-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Candidate" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Stage" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Resume" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Test" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Interview" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Final Score" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Matched Skills" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: sorted.map((app, i) => {
                                    const finalScore = app.final_score ?? app.resume_score;
                                    return (_jsxs("tr", { className: i % 2 === 1 ? "bg-slate-50/60" : "bg-white", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx(UserCircle, { className: "h-8 w-8 text-gray-300 flex-shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsx(Link, { to: `/candidates/${app.candidate_id}`, className: "text-sm font-semibold text-blue-700 hover:underline truncate block", children: app.candidate_name }), _jsx("p", { className: "text-xs text-gray-400 truncate", children: app.candidate_email })] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `text-xs font-semibold px-2.5 py-1 rounded-full ${stageBadge(app.stage)}`, children: stageLabel(app.stage) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: app.resume_score !== null
                                                    ? _jsxs("span", { className: `text-xs font-bold px-2 py-1 rounded-lg border ${scoreColor(app.resume_score)}`, children: [app.resume_score.toFixed(0), "%"] })
                                                    : _jsx("span", { className: "text-xs text-gray-300", children: "\u2014" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: app.test_score !== null
                                                    ? _jsxs("span", { className: `text-xs font-bold px-2 py-1 rounded-lg border ${scoreColor(app.test_score)}`, children: [app.test_score.toFixed(0), "%"] })
                                                    : _jsx("span", { className: "text-xs text-gray-300", children: "\u2014" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: (app.interview_score !== null || app.hr_interview_score !== null) ? (_jsxs("div", { className: "flex gap-1", children: [app.interview_score !== null && (_jsxs("span", { className: `text-xs font-bold px-2 py-1 rounded-lg border ${scoreColor(app.interview_score)}`, children: ["R1: ", app.interview_score.toFixed(0), "%"] })), app.hr_interview_score !== null && (_jsxs("span", { className: `text-xs font-bold px-2 py-1 rounded-lg border ${scoreColor(app.hr_interview_score)}`, children: ["R2: ", app.hr_interview_score.toFixed(0), "%"] }))] })) : _jsx("span", { className: "text-xs text-gray-300", children: "\u2014" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: finalScore !== null
                                                    ? _jsxs("span", { className: `text-sm font-bold px-3 py-1.5 rounded-xl border ${scoreColor(finalScore)}`, children: [finalScore.toFixed(0), "%"] })
                                                    : _jsx("span", { className: "text-xs text-gray-300", children: "\u2014" }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex flex-wrap gap-1 max-w-xs", children: [app.matched_skills.slice(0, 4).map((s) => (_jsx("span", { className: "px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200", children: s }, s))), app.matched_skills.length > 4 && (_jsxs("span", { className: "text-xs text-gray-400", children: ["+", app.matched_skills.length - 4] }))] }) })] }, app.id));
                                }) })] }) }) })] }));
}
