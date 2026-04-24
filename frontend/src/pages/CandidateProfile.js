import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserCircle, Mail, Phone, FileText, CheckCircle2, XCircle, Calendar, Award, Loader2, Send, Edit3, ChevronDown, ChevronUp, GitBranch, } from "lucide-react";
import Layout from "../components/Layout";
import { applicationService, interviewService, candidateService, } from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
// ── helpers ──────────────────────────────────────────────────────────────────
function ScorePill({ label, value, color }) {
    if (value === null)
        return null;
    return (_jsxs("div", { className: `flex flex-col items-center px-4 py-3 rounded-xl border ${color}`, children: [_jsx("span", { className: "text-xl font-bold", children: value.toFixed(0) }), _jsx("span", { className: "text-xs font-medium mt-0.5 opacity-75", children: label })] }));
}
function stageBadgeColor(stage) {
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
        applied: "Applied",
        shortlisted: "Shortlisted",
        test_sent: "Test Sent",
        tested: "Assessment Done",
        interview_1: "Round 1 Interview",
        interview_2: "Round 2 Interview",
        offered: "Offered",
        rejected: "Rejected",
    };
    return map[stage] ?? stage;
}
// ── Offer draft modal (reused from Pipeline) ─────────────────────────────────
function OfferDraftModal({ app, onClose, onSent }) {
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
            const { data } = await applicationService.offer(app.id, draft);
            onSent(data);
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
// ── Reject confirmation modal ─────────────────────────────────────────────────
function RejectConfirmModal({ name, onConfirm, onClose, loading }) {
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-red-100 rounded-full p-2", children: _jsx(XCircle, { className: "h-5 w-5 text-red-600" }) }), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Reject Candidate?" })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["A rejection email will be sent to ", _jsx("strong", { children: name }), ". This action cannot be undone."] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: onConfirm, disabled: loading, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50", children: [loading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(XCircle, { className: "h-4 w-4" }), loading ? "Rejecting…" : "Yes, reject & notify"] }), _jsx("button", { onClick: onClose, className: "px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] }) }));
}
// ── Main page ─────────────────────────────────────────────────────────────────
export default function CandidateProfile() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResume, setShowResume] = useState(false);
    const [offerModal, setOfferModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const load = useCallback(async () => {
        if (!candidateId)
            return;
        setLoading(true);
        setError(null);
        try {
            const [{ data: cand }, { data: allInterviews }, { data: apps }] = await Promise.all([
                candidateService.get(candidateId),
                interviewService.list(),
                applicationService.listByCandidate(candidateId),
            ]);
            setCandidate(cand);
            setInterviews(allInterviews.filter((iv) => iv.candidate_id === candidateId));
            setApplications(apps);
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to load candidate"));
        }
        finally {
            setLoading(false);
        }
    }, [candidateId]);
    useEffect(() => { load(); }, [load]);
    const handleReject = async () => {
        if (!rejectModal)
            return;
        setRejectLoading(true);
        setActionError(null);
        try {
            const { data } = await applicationService.reject(rejectModal.id);
            setApplications((prev) => prev.map((a) => a.id === data.id ? data : a));
            setRejectModal(null);
        }
        catch (e) {
            setActionError(getApiErrorMessage(e, "Failed to reject"));
        }
        finally {
            setRejectLoading(false);
        }
    };
    if (loading) {
        return (_jsx(Layout, { children: _jsx("div", { className: "flex justify-center py-24", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) }) }));
    }
    if (error || !candidate) {
        return (_jsx(Layout, { children: _jsxs("div", { className: "max-w-md mx-auto text-center py-16", children: [_jsx("p", { className: "text-red-600 mb-4", children: error ?? "Candidate not found" }), _jsx("button", { onClick: () => navigate(-1), className: "text-sm text-blue-600 hover:underline", children: "\u2190 Go back" })] }) }));
    }
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "max-w-4xl mx-auto space-y-6 px-4 sm:px-0", children: [_jsxs("button", { onClick: () => navigate(-1), className: "inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " Back"] }), _jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start gap-5 flex-wrap", children: [_jsx("div", { className: "h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-2xl font-bold text-white", children: candidate.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: candidate.full_name }), _jsxs("div", { className: "flex flex-wrap gap-4 mt-2 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Mail, { className: "h-4 w-4" }), candidate.email] }), candidate.phone && (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Phone, { className: "h-4 w-4" }), candidate.phone] }))] })] }), _jsxs(Link, { to: "/pipeline", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: [_jsx(GitBranch, { className: "h-4 w-4" }), " View Pipeline"] })] }) }), actionError && (_jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: actionError })), applications.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center", children: [_jsx(UserCircle, { className: "h-10 w-10 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500 text-sm", children: "No applications found for this candidate." })] })) : (applications.map((app) => {
                        const appInterviews = interviews.filter((iv) => iv.application_id === app.id);
                        return (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 font-medium uppercase tracking-wide", children: "Application" }), _jsxs("p", { className: "text-sm font-semibold text-gray-900 mt-0.5", children: ["Applied ", new Date(app.applied_at).toLocaleDateString(undefined, { dateStyle: "medium" })] })] }), _jsx("span", { className: `text-xs font-bold px-3 py-1 rounded-full ${stageBadgeColor(app.stage)}`, children: stageLabel(app.stage) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3", children: "Score Breakdown" }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(ScorePill, { label: "Resume", value: app.resume_score, color: "bg-slate-50 border-slate-200 text-slate-700" }), _jsx(ScorePill, { label: "Assessment", value: app.test_score, color: "bg-blue-50 border-blue-200 text-blue-700" }), _jsx(ScorePill, { label: "Round 1", value: app.interview_score, color: "bg-amber-50 border-amber-200 text-amber-700" }), _jsx(ScorePill, { label: "Round 2", value: app.hr_interview_score, color: "bg-purple-50 border-purple-200 text-purple-700" }), app.final_score !== null && (_jsxs("div", { className: "flex flex-col items-center px-4 py-3 rounded-xl border bg-green-50 border-green-200 text-green-700", children: [_jsx("span", { className: "text-xl font-bold", children: app.final_score.toFixed(0) }), _jsx("span", { className: "text-xs font-semibold mt-0.5", children: "Final \u2605" })] }))] })] }), (app.matched_skills.length > 0 || app.missing_skills.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [app.matched_skills.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2", children: "Matched Skills" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: app.matched_skills.map((s) => (_jsx("span", { className: "px-2 py-0.5 rounded-md text-xs bg-green-50 text-green-700 border border-green-200", children: s }, s))) })] })), app.missing_skills.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2", children: "Missing Skills" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: app.missing_skills.map((s) => (_jsx("span", { className: "px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-600 border border-red-200", children: s }, s))) })] }))] })), appInterviews.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3", children: "Interview History" }), _jsx("div", { className: "space-y-2", children: appInterviews.map((iv) => (_jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200", children: [_jsx(Calendar, { className: "h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "text-xs font-semibold text-gray-700", children: ["Round ", iv.round_number] }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${iv.status === "completed" ? "bg-green-100 text-green-700" :
                                                                                    iv.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                                        "bg-blue-100 text-blue-700"}`, children: iv.status }), iv.score !== null && (_jsxs("span", { className: "text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full", children: [_jsx(Award, { className: "h-3 w-3 inline mr-0.5" }), iv.score, "/100"] }))] }), iv.scheduled_at && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(iv.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) })), iv.meet_link && (_jsx("a", { href: iv.meet_link, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline mt-0.5 block truncate", children: iv.meet_link })), iv.feedback && (_jsxs("p", { className: "text-xs text-gray-600 mt-1 italic", children: ["\"", iv.feedback, "\""] }))] })] }, iv.id))) })] })), app.stage !== "rejected" && app.stage !== "offered" && (_jsxs("div", { className: "flex flex-wrap gap-2 pt-2 border-t border-gray-100", children: [(app.stage === "interview_1" || app.stage === "interview_2") && (_jsxs("button", { onClick: () => setOfferModal(app), className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), " Send Offer"] })), _jsxs("button", { onClick: () => setRejectModal(app), className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100", children: [_jsx(XCircle, { className: "h-4 w-4" }), " Reject"] }), _jsxs(Link, { to: "/pipeline", className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: [_jsx(Send, { className: "h-4 w-4" }), " Manage in Pipeline"] })] }))] })] }, app.id));
                    })), candidate.resume_text && (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("button", { onClick: () => setShowResume((s) => !s), className: "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5 text-gray-400" }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: "Resume Text" })] }), showResume ? _jsx(ChevronUp, { className: "h-4 w-4 text-gray-400" }) : _jsx(ChevronDown, { className: "h-4 w-4 text-gray-400" })] }), showResume && (_jsx("div", { className: "px-6 pb-6", children: _jsx("pre", { className: "text-xs text-gray-700 bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap max-h-96 overflow-y-auto font-mono leading-relaxed", children: candidate.resume_text }) }))] }))] }), offerModal && (_jsx(OfferDraftModal, { app: offerModal, onClose: () => setOfferModal(null), onSent: (updated) => {
                    setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
                    setOfferModal(null);
                } })), rejectModal && (_jsx(RejectConfirmModal, { name: rejectModal.candidate_name, onConfirm: handleReject, onClose: () => setRejectModal(null), loading: rejectLoading }))] }));
}
