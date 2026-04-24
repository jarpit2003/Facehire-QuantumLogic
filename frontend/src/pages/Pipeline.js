import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Users, Loader2, UserCircle, Send, Calendar, XCircle, Award, RefreshCw, Edit3, CheckCircle2, ArrowRight, } from "lucide-react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { applicationService, interviewService } from "../services/api";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";
// ── Offer draft modal ────────────────────────────────────────────────────────
function OfferDraftModal({ app, onClose, onSent, }) {
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        applicationService.getOfferDraft(app.id)
            .then(({ data }) => setDraft(data.draft))
            .catch(() => setDraft(`Dear ${app.candidate_name},\n\nCongratulations! We are pleased to offer you this position.\n\nBest regards,\nFairHire AI Recruitment Team`))
            .finally(() => setLoading(false));
    }, [app.id]);
    const handleSend = async () => {
        setSending(true);
        setError(null);
        try {
            const { data: updatedApp } = await applicationService.offer(app.id, draft);
            onSent(updatedApp);
            onClose();
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to send offer"));
        }
        finally {
            setSending(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Edit3, { className: "h-5 w-5 text-green-600" }), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Offer Letter Draft" })] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["AI-generated for ", _jsx("strong", { children: app.candidate_name }), ". Edit before sending."] }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-blue-600" }) })) : (_jsx("textarea", { value: draft, onChange: (e) => setDraft(e.target.value), rows: 12, className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y" })), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: handleSend, disabled: sending || loading, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50", children: [sending ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(CheckCircle2, { className: "h-4 w-4" }), sending ? "Sending offer…" : "Send offer email"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
// ── Stage config ─────────────────────────────────────────────────────────────
const STAGES = [
    { key: "applied", label: "Applied", color: "border-t-slate-400", bg: "bg-slate-50" },
    { key: "shortlisted", label: "Shortlisted", color: "border-t-cyan-400", bg: "bg-cyan-50" },
    { key: "test_sent", label: "Test Sent", color: "border-t-sky-400", bg: "bg-sky-50" },
    { key: "tested", label: "Assessment", color: "border-t-blue-400", bg: "bg-blue-50" },
    { key: "interview_1", label: "Round 1", color: "border-t-amber-400", bg: "bg-amber-50" },
    { key: "interview_2", label: "Round 2", color: "border-t-purple-400", bg: "bg-purple-50" },
    { key: "offered", label: "Offered", color: "border-t-green-400", bg: "bg-green-50" },
    { key: "rejected", label: "Rejected", color: "border-t-red-300", bg: "bg-red-50" },
];
// ── Reject confirmation modal ─────────────────────────────────────────────────
function RejectConfirmModal({ name, onConfirm, onClose, loading }) {
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-red-100 rounded-full p-2", children: _jsx(XCircle, { className: "h-5 w-5 text-red-600" }) }), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Reject Candidate?" })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["A rejection email will be sent to ", _jsx("strong", { children: name }), ". This cannot be undone."] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: onConfirm, disabled: loading, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50", children: [loading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(XCircle, { className: "h-4 w-4" }), loading ? "Rejecting…" : "Yes, reject & notify"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
function scoreColor(s) {
    if (s === null)
        return "text-gray-400";
    if (s >= 80)
        return "text-green-700 bg-green-50 border-green-200";
    if (s >= 60)
        return "text-blue-700 bg-blue-50 border-blue-200";
    if (s >= 40)
        return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
}
// ── Test score modal ────────────────────────────────────────────────────────
function TestScoreModal({ app, onClose, onSaved, }) {
    const [score, setScore] = useState("");
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
            const { data } = await applicationService.recordTestScore(app.id, s);
            onSaved(data);
            onClose();
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to save score"));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Enter Test Score" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Candidate: ", _jsx("strong", { children: app.candidate_name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Score (0\u2013100)" }), _jsx("input", { type: "number", min: "0", max: "100", value: score, onChange: (e) => setScore(e.target.value), placeholder: "e.g. 78", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", autoFocus: true })] }), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: handleSave, disabled: saving || !score, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Award, { className: "h-4 w-4" }), saving ? "Saving…" : "Save & re-rank"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
// ── Test link modal ───────────────────────────────────────────────────────────
function TestLinkModal({ app, onClose, onSent, }) {
    const [link, setLink] = useState("");
    const [deadline, setDeadline] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const handleSend = async () => {
        if (!link.trim())
            return;
        setSending(true);
        setError(null);
        try {
            const { data } = await applicationService.sendTestLink(app.id, link.trim(), deadline || undefined);
            onSent(data);
            onClose();
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to send test link"));
        }
        finally {
            setSending(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Send Assessment Link" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Sending to ", _jsx("strong", { children: app.candidate_name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Test / Assessment URL" }), _jsx("input", { type: "url", value: link, onChange: (e) => setLink(e.target.value), placeholder: "https://hackerrank.com/test/...", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Deadline (optional)" }), _jsx("input", { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: handleSend, disabled: sending || !link.trim(), className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [sending ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Send, { className: "h-4 w-4" }), sending ? "Sending…" : "Send link"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
// ── Schedule interview modal ──────────────────────────────────────────────────
function ScheduleModal({ app, roundNumber, onClose, onScheduled, }) {
    const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
    const [date, setDate] = useState(tomorrow());
    const [time, setTime] = useState("10:00");
    const [meetLink, setMeetLink] = useState("");
    const [interviewerId, setInterviewerId] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const handleSchedule = async () => {
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (interviewerId && !UUID_RE.test(interviewerId.trim())) {
            setError("Interviewer ID must be a valid UUID (e.g. from the HR Users list).");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await interviewService.schedule({
                candidate_id: app.candidate_id,
                job_id: app.job_id,
                application_id: app.id,
                round_number: roundNumber,
                scheduled_at: `${date}T${time}:00`,
                meet_link: meetLink || null,
                interviewer_id: interviewerId.trim() || null,
                notes: notes || null,
            });
            const targetStage = roundNumber === 1 ? "interview_1" : "interview_2";
            const { data: updatedApp } = await applicationService.advanceStage(app.id, targetStage);
            onScheduled(updatedApp);
            onClose();
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to schedule interview"));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4", children: [_jsxs("h2", { className: "text-lg font-bold text-gray-900", children: ["Schedule Round ", roundNumber, " Interview"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Candidate: ", _jsx("strong", { children: app.candidate_name })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Date" }), _jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Time" }), _jsx("input", { type: "time", value: time, onChange: (e) => setTime(e.target.value), className: "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Interviewer ID (optional)" }), _jsx("input", { type: "text", value: interviewerId, onChange: (e) => setInterviewerId(e.target.value), placeholder: "Paste interviewer UUID from HR Users", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Meet link (optional)" }), _jsx("input", { type: "url", value: meetLink, onChange: (e) => setMeetLink(e.target.value), placeholder: "https://meet.google.com/...", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Notes" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] }), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: handleSchedule, disabled: saving, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Calendar, { className: "h-4 w-4" }), saving ? "Scheduling…" : "Schedule & notify"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
// ── Candidate card ────────────────────────────────────────────────────────────
function CandidateCard({ app, selected, onSelect, onAction, }) {
    const score = app.final_score ?? app.resume_score;
    return (_jsxs("div", { className: `bg-white rounded-xl border shadow-sm p-4 space-y-3 transition-all ${selected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200"}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("input", { type: "checkbox", checked: selected, onChange: () => onSelect(app.id), className: "h-3.5 w-3.5 rounded border-gray-300 text-blue-600 flex-shrink-0 cursor-pointer", onClick: (e) => e.stopPropagation() }), _jsx(UserCircle, { className: "h-7 w-7 text-gray-300 flex-shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsx(Link, { to: `/candidates/${app.candidate_id}`, className: "text-sm font-semibold text-blue-700 hover:underline truncate block", children: app.candidate_name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: app.candidate_email })] })] }), score !== null && (_jsxs("span", { className: `text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${scoreColor(score)}`, children: [score.toFixed(0), "%"] }))] }), (app.resume_score !== null || app.test_score !== null) && (_jsxs("div", { className: "flex flex-wrap gap-1.5 text-xs", children: [app.resume_score !== null && (_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-slate-100 text-slate-700", children: ["Resume ", app.resume_score.toFixed(0), "%"] })), app.test_score !== null && (_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-blue-100 text-blue-700", children: ["Test ", app.test_score.toFixed(0), "%"] })), app.interview_score !== null && (_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-amber-100 text-amber-700", children: ["R1 ", app.interview_score.toFixed(0), "%"] })), app.hr_interview_score !== null && (_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-purple-100 text-purple-700", children: ["R2 ", app.hr_interview_score.toFixed(0), "%"] }))] })), app.matched_skills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1", children: [app.matched_skills.slice(0, 3).map((s) => (_jsx("span", { className: "px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200", children: s }, s))), app.matched_skills.length > 3 && (_jsxs("span", { className: "text-xs text-gray-400", children: ["+", app.matched_skills.length - 3] }))] })), _jsxs("div", { className: "flex flex-wrap gap-1.5 pt-1 border-t border-gray-100", children: [app.stage === "applied" && (_jsxs("button", { onClick: () => onAction("shortlist", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700 hover:bg-cyan-100", children: [_jsx(CheckCircle2, { className: "h-3 w-3" }), " Shortlist"] })), (app.stage === "applied" || app.stage === "shortlisted") && (_jsxs("button", { onClick: () => onAction("test", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100", children: [_jsx(Send, { className: "h-3 w-3" }), " Send test"] })), app.stage === "test_sent" && (_jsxs("button", { onClick: () => onAction("testscore", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-100", children: [_jsx(Award, { className: "h-3 w-3" }), " Enter score"] })), app.stage === "tested" && (_jsxs("button", { onClick: () => onAction("testscore", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100", children: [_jsx(Award, { className: "h-3 w-3" }), " Enter score"] })), (app.stage === "applied" || app.stage === "shortlisted" || app.stage === "tested") && (_jsxs("button", { onClick: () => onAction("interview1", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100", children: [_jsx(Calendar, { className: "h-3 w-3" }), " Round 1"] })), app.stage === "interview_1" && (_jsxs("button", { onClick: () => onAction("interview2", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-100", children: [_jsx(Calendar, { className: "h-3 w-3" }), " Round 2"] })), (app.stage === "interview_1" || app.stage === "interview_2") && (_jsxs("button", { onClick: () => onAction("offer", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100", children: [_jsx(Award, { className: "h-3 w-3" }), " Offer"] })), app.stage !== "rejected" && app.stage !== "offered" && (_jsxs("button", { onClick: () => onAction("reject", app), className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100", children: [_jsx(XCircle, { className: "h-3 w-3" }), " Reject"] }))] })] }));
}
// ── Main page ─────────────────────────────────────────────────────────────────
export default function Pipeline() {
    const { activeJob } = useJobs();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [testModal, setTestModal] = useState(null);
    const [testScoreModal, setTestScoreModal] = useState(null);
    const [scheduleModal, setScheduleModal] = useState(null);
    const [offerModal, setOfferModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);
    const isRealDbRecord = (app) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.id);
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
            setError(getApiErrorMessage(e, "Failed to load applications"));
        }
        finally {
            setLoading(false);
        }
    }, [activeJob]);
    useEffect(() => { load(); }, [load]);
    const handleAction = async (action, app) => {
        if (action === "shortlist") {
            if (!isRealDbRecord(app)) {
                setError("Cannot shortlist — re-run pipeline to persist candidates.");
                return;
            }
            try {
                const { data } = await applicationService.shortlist(app.id);
                setApplications((prev) => prev.map((a) => a.id === data.id ? data : a));
            }
            catch (e) {
                setError(getApiErrorMessage(e, "Action failed"));
            }
            return;
        }
        if (action === "test") {
            setTestModal(app);
            return;
        }
        if (action === "testscore") {
            setTestScoreModal(app);
            return;
        }
        if (action === "interview1") {
            setScheduleModal({ app, round: 1 });
            return;
        }
        if (action === "interview2") {
            setScheduleModal({ app, round: 2 });
            return;
        }
        if (action === "offer") {
            setOfferModal(app);
            return;
        }
        if (action === "reject") {
            setRejectModal(app);
            return;
        }
    };
    const confirmReject = async () => {
        if (!rejectModal)
            return;
        if (!isRealDbRecord(rejectModal)) {
            setError("This candidate was not saved to the database. Re-run the pipeline to persist candidates.");
            setRejectModal(null);
            return;
        }
        setRejectLoading(true);
        setApplications((prev) => prev.map((a) => a.id === rejectModal.id ? { ...a, stage: "rejected" } : a));
        try {
            await applicationService.reject(rejectModal.id);
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Action failed"));
            setApplications((prev) => prev.map((a) => a.id === rejectModal.id ? { ...a, stage: rejectModal.stage } : a));
        }
        finally {
            setRejectLoading(false);
            setRejectModal(null);
        }
    };
    const toggleSelect = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const selectedApps = applications.filter((a) => selected.has(a.id));
    const bulkShortlist = async () => {
        setBulkLoading(true);
        await Promise.allSettled(selectedApps.filter(isRealDbRecord).map((a) => applicationService.shortlist(a.id).then(({ data }) => setApplications((prev) => prev.map((x) => x.id === data.id ? data : x)))));
        setSelected(new Set());
        setBulkLoading(false);
    };
    const bulkReject = async () => {
        if (!window.confirm(`Reject ${selectedApps.length} candidate(s)? Rejection emails will be sent.`))
            return;
        setBulkLoading(true);
        await Promise.allSettled(selectedApps.filter(isRealDbRecord).map((a) => applicationService.reject(a.id).then(({ data }) => setApplications((prev) => prev.map((x) => x.id === data.id ? data : x)))));
        setSelected(new Set());
        setBulkLoading(false);
    };
    const byStage = (stage) => applications
        .filter((a) => a.stage === stage)
        .sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0));
    if (!activeJob) {
        return (_jsx(Layout, { children: _jsxs("div", { className: "max-w-md mx-auto text-center py-16", children: [_jsx(Users, { className: "h-12 w-12 text-gray-300 mx-auto mb-4" }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "No active job" }), _jsx("p", { className: "mt-2 text-gray-500", children: "Select a job from the sidebar to view its pipeline." })] }) }));
    }
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "px-4 sm:px-0 space-y-6", children: [_jsx("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6", children: _jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Pipeline" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [activeJob.title, " \u00B7 ", applications.length, " applicants"] })] }), _jsxs("button", { onClick: load, disabled: loading, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] }) }), error && (_jsx("div", { className: "p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: error })), selected.size > 0 && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap", children: [_jsxs("span", { className: "text-sm font-semibold text-blue-800", children: [selected.size, " selected"] }), _jsxs("button", { onClick: bulkShortlist, disabled: bulkLoading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 disabled:opacity-50", children: [bulkLoading ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), "Shortlist all"] }), _jsxs("button", { onClick: bulkReject, disabled: bulkLoading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50", children: [bulkLoading ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(XCircle, { className: "h-3.5 w-3.5" }), "Reject all"] }), _jsx("button", { onClick: () => setSelected(new Set()), className: "ml-auto text-xs text-blue-600 hover:underline font-medium", children: "Clear" })] })), loading && applications.length === 0 ? (_jsx("div", { className: "flex justify-center py-16", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) })) : !loading && applications.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-10 text-center", children: [_jsx(Users, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["No applications yet for ", _jsx("strong", { children: activeJob.title }), "."] }), _jsxs(Link, { to: "/process-resumes", className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: ["Process Resumes ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] })) : (
                    /* Kanban board — sorted by score desc within each column */
                    _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 items-start", children: STAGES.map(({ key, label, color, bg }) => {
                            const cards = byStage(key);
                            return (_jsxs("div", { className: `rounded-2xl border border-gray-200 border-t-4 ${color} ${bg} overflow-hidden`, children: [_jsxs("div", { className: "px-3 py-3 flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold text-gray-700 uppercase tracking-wide", children: label }), _jsx("span", { className: "text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full", children: cards.length })] }), _jsx("div", { className: "px-2 pb-3 space-y-2 min-h-[120px]", children: cards.length === 0 ? (_jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "Empty" })) : (cards.map((app) => (_jsx(CandidateCard, { app: app, selected: selected.has(app.id), onSelect: toggleSelect, onAction: handleAction }, app.id)))) })] }, key));
                        }) }))] }), testScoreModal && (_jsx(TestScoreModal, { app: testScoreModal, onClose: () => setTestScoreModal(null), onSaved: (updated) => {
                    setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
                    setTestScoreModal(null);
                } })), testModal && (_jsx(TestLinkModal, { app: testModal, onClose: () => setTestModal(null), onSent: (updated) => {
                    setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
                    setTestModal(null);
                } })), scheduleModal && (_jsx(ScheduleModal, { app: scheduleModal.app, roundNumber: scheduleModal.round, onClose: () => setScheduleModal(null), onScheduled: (updatedApp) => {
                    setApplications((prev) => prev.map((a) => a.id === updatedApp.id ? updatedApp : a));
                    setScheduleModal(null);
                } })), offerModal && (_jsx(OfferDraftModal, { app: offerModal, onClose: () => setOfferModal(null), onSent: (updatedApp) => {
                    setApplications((prev) => prev.map((a) => a.id === updatedApp.id ? updatedApp : a));
                    setOfferModal(null);
                } })), rejectModal && (_jsx(RejectConfirmModal, { name: rejectModal.candidate_name, loading: rejectLoading, onConfirm: confirmReject, onClose: () => setRejectModal(null) }))] }));
}
