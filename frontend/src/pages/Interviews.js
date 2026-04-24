import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, UserCircle, CheckCircle2, Loader2, RefreshCw, Star, GitBranch, } from "lucide-react";
import { interviewService, candidateService } from "../services/api";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";
import Layout from "../components/Layout";
function roundBadge(n) {
    const map = {
        1: "bg-amber-50 text-amber-800 border-amber-200",
        2: "bg-purple-50 text-purple-800 border-purple-200",
    };
    return map[n] ?? "bg-gray-100 text-gray-700 border-gray-200";
}
function statusBadge(s) {
    if (s === "completed")
        return "bg-green-100 text-green-800 border-green-200";
    if (s === "cancelled")
        return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-50 text-blue-800 border-blue-200";
}
function ScoreModal({ interview, onClose, onSaved, }) {
    const [score, setScore] = useState(interview.score?.toString() ?? "");
    const [feedback, setFeedback] = useState(interview.feedback ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const handleSave = async () => {
        const s = parseFloat(score);
        if (isNaN(s) || s < 0 || s > 100) {
            setError("Score must be 0–100");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await interviewService.submitScore(interview.id, s, feedback || undefined);
            onSaved();
            onClose();
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to save score"));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Submit Interview Score" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Round ", interview.round_number, " \u00B7 ", new Date(interview.scheduled_at ?? "").toLocaleDateString()] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Score (0\u2013100)" }), _jsx("input", { type: "number", min: "0", max: "100", value: score, onChange: (e) => setScore(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Feedback (optional)" }), _jsx("textarea", { value: feedback, onChange: (e) => setFeedback(e.target.value), rows: 4, placeholder: "Technical skills, communication, culture fit\u2026", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] }), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: handleSave, disabled: saving, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Star, { className: "h-4 w-4" }), saving ? "Saving…" : "Save score"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
export default function Interviews() {
    const { activeJob } = useJobs();
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scoreModal, setScoreModal] = useState(null);
    const load = useCallback(async () => {
        if (!activeJob)
            return;
        setLoading(true);
        setError(null);
        try {
            const [{ data: ivs }, { data: cands }] = await Promise.all([
                interviewService.list(activeJob.id),
                candidateService.list(),
            ]);
            setInterviews(ivs);
            const nameMap = {};
            cands.forEach((c) => { nameMap[c.id] = c.full_name; });
            setCandidates(nameMap);
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to load interviews"));
        }
        finally {
            setLoading(false);
        }
    }, [activeJob]);
    useEffect(() => { load(); }, [load]);
    const scheduled = interviews.filter((i) => i.status === "scheduled");
    const completed = interviews.filter((i) => i.status === "completed");
    if (!activeJob) {
        return (_jsx(Layout, { children: _jsxs("div", { className: "px-4 sm:px-0 max-w-2xl mx-auto text-center py-16", children: [_jsx(Calendar, { className: "h-12 w-12 text-gray-300 mx-auto mb-4" }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "No active job" }), _jsx("p", { className: "mt-2 text-gray-500", children: "Select a job from the navbar to view its interviews." })] }) }));
    }
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "px-4 sm:px-0 space-y-6", children: [_jsx("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6", children: _jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Interviews" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [activeJob.title, " \u00B7 ", interviews.length, " total \u00B7 ", scheduled.length, " upcoming"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { to: "/pipeline", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: [_jsx(GitBranch, { className: "h-4 w-4" }), " Pipeline"] }), _jsxs("button", { onClick: load, disabled: loading, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] }) }), error && _jsx("div", { className: "p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: error }), loading && interviews.length === 0 ? (_jsx("div", { className: "flex justify-center py-16", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) })) : interviews.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-10 text-center", children: [_jsx(Calendar, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 mb-4", children: "No interviews scheduled yet for this job." }), _jsxs(Link, { to: "/pipeline", className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: ["Go to Pipeline ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] })) : (_jsxs("div", { className: "space-y-6", children: [scheduled.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 bg-blue-50/40 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5 text-blue-600" }), _jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Upcoming" }), _jsx("span", { className: "ml-auto text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full", children: scheduled.length })] }), _jsx("ul", { className: "divide-y divide-gray-100", children: scheduled.map((iv) => (_jsx(InterviewRow, { iv: iv, candidateName: candidates[iv.candidate_id] ?? "", onScore: () => setScoreModal(iv) }, iv.id))) })] })), completed.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 bg-green-50/40 flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600" }), _jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Completed" }), _jsx("span", { className: "ml-auto text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full", children: completed.length })] }), _jsx("ul", { className: "divide-y divide-gray-100", children: completed.map((iv) => (_jsx(InterviewRow, { iv: iv, candidateName: candidates[iv.candidate_id] ?? "", onScore: () => setScoreModal(iv) }, iv.id))) })] }))] }))] }), scoreModal && (_jsx(ScoreModal, { interview: scoreModal, onClose: () => setScoreModal(null), onSaved: () => { load(); setScoreModal(null); } }))] }));
}
function InterviewRow({ iv, candidateName, onScore }) {
    const date = iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : "—";
    return (_jsxs("li", { className: "px-6 py-4 flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx(UserCircle, { className: "h-9 w-9 text-gray-300 flex-shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx(Link, { to: `/candidates/${iv.candidate_id}`, className: "text-sm font-semibold text-blue-700 hover:underline", children: candidateName || "Unknown Candidate" }), _jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full border ${roundBadge(iv.round_number)}`, children: ["Round ", iv.round_number] }), _jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(iv.status)}`, children: iv.status })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: date }), iv.meet_link && (_jsx("a", { href: iv.meet_link, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline mt-0.5 block truncate max-w-xs", children: iv.meet_link })), iv.score !== null && (_jsxs("p", { className: "text-xs font-semibold text-green-700 mt-1", children: ["Score: ", iv.score, "/100"] })), iv.feedback && (_jsxs("p", { className: "text-xs text-gray-500 mt-0.5 truncate max-w-sm italic", children: ["\"", iv.feedback, "\""] }))] })] }), _jsxs("button", { onClick: onScore, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 flex-shrink-0", children: [_jsx(Star, { className: "h-3.5 w-3.5" }), iv.score !== null ? "Update score" : "Submit score"] })] }));
}
