import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, Calendar, TrendingUp, ArrowRight, RefreshCw, Loader2, UserCircle, CheckCircle2, Clock, FileStack, Award, } from "lucide-react";
import Layout from "../components/Layout";
import { applicationService, interviewService } from "../services/api";
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
function MetricCard({ label, value, icon, color }) {
    return (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4", children: [_jsx("div", { className: `rounded-xl p-3 flex-shrink-0 ${color}`, children: icon }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), _jsx("p", { className: "text-xs font-medium text-gray-500 mt-0.5", children: label })] })] }));
}
export default function Dashboard() {
    const { activeJob, jobs } = useJobs();
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!activeJob)
            return;
        setLoading(true);
        setError(null);
        try {
            const [{ data: apps }, { data: ivs }] = await Promise.all([
                applicationService.list(activeJob.id),
                interviewService.list(activeJob.id),
            ]);
            setApplications(apps);
            setInterviews(ivs);
        }
        catch (e) {
            setError(getApiErrorMessage(e, "Failed to load dashboard"));
        }
        finally {
            setLoading(false);
        }
    }, [activeJob]);
    useEffect(() => { load(); }, [load]);
    // No job created yet
    if (jobs.length === 0) {
        return (_jsx(Layout, { children: _jsx("div", { className: "max-w-lg mx-auto mt-16 text-center", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10", children: [_jsx("div", { className: "bg-blue-50 rounded-2xl p-4 inline-flex mb-5", children: _jsx(Briefcase, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Welcome to FairHire AI" }), _jsx("p", { className: "mt-2 text-sm text-gray-500 leading-relaxed", children: "Start by creating a job requisition. Then upload resumes and let AI rank your candidates automatically." }), _jsx("div", { className: "mt-6 flex flex-col gap-3", children: _jsxs(Link, { to: "/jobs", className: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: ["Create your first job ", _jsx(ArrowRight, { className: "h-4 w-4" })] }) })] }) }) }));
    }
    // Job exists but none active
    if (!activeJob) {
        return (_jsx(Layout, { children: _jsx("div", { className: "max-w-lg mx-auto mt-16 text-center", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10", children: [_jsx(Briefcase, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Select a job" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Use the job switcher in the sidebar to select an active job." })] }) }) }));
    }
    // Metrics
    const active = applications.filter((a) => a.status !== "rejected");
    const avgScore = active.length > 0
        ? Math.round(active.reduce((s, a) => s + (a.final_score ?? a.resume_score ?? 0), 0) / active.length)
        : 0;
    const interviewReady = applications.filter((a) => (a.final_score ?? a.resume_score ?? 0) >= 70 && a.status !== "rejected").length;
    const upcomingInterviews = interviews.filter((i) => i.status === "scheduled").length;
    // Top 5 candidates by score
    const topCandidates = [...applications]
        .filter((a) => a.status !== "rejected")
        .sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0))
        .slice(0, 5);
    // Stage funnel counts
    const stageCounts = ["applied", "shortlisted", "test_sent", "tested", "interview_1", "interview_2", "offered"].map((s) => ({
        stage: s,
        count: applications.filter((a) => a.stage === s).length,
    }));
    // Upcoming interviews
    const upcoming = interviews.filter((i) => i.status === "scheduled").slice(0, 3);
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full", children: [_jsx(Briefcase, { className: "h-3 w-3" }), activeJob.title] }), _jsxs("span", { className: "text-xs text-gray-400", children: [applications.length, " total applicants"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Link, { to: "/process-resumes", className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50", children: [_jsx(FileStack, { className: "h-4 w-4" }), " Upload Resumes"] }), _jsxs("button", { onClick: load, disabled: loading, className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), " Refresh"] })] })] }), error && _jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: error }), loading && applications.length === 0 ? (_jsx("div", { className: "flex justify-center py-24", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) })) : applications.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center", children: [_jsx(FileStack, { className: "h-10 w-10 text-gray-300 mx-auto mb-4" }), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: "No applications yet" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Upload resumes to start scoring and ranking candidates." }), _jsxs(Link, { to: "/process-resumes", className: "mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: ["Upload Resumes ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { label: "Total Applicants", value: applications.length, color: "bg-blue-50", icon: _jsx(Users, { className: "h-6 w-6 text-blue-600" }) }), _jsx(MetricCard, { label: "Avg Resume Score", value: `${avgScore}%`, color: "bg-indigo-50", icon: _jsx(TrendingUp, { className: "h-6 w-6 text-indigo-600" }) }), _jsx(MetricCard, { label: "Interview Ready (\u226570%)", value: interviewReady, color: "bg-green-50", icon: _jsx(Award, { className: "h-6 w-6 text-green-600" }) }), _jsx(MetricCard, { label: "Upcoming Interviews", value: upcomingInterviews, color: "bg-amber-50", icon: _jsx(Calendar, { className: "h-6 w-6 text-amber-600" }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-bold text-gray-900", children: "Top Candidates" }), _jsxs(Link, { to: "/pipeline", className: "text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1", children: ["View all ", _jsx(ArrowRight, { className: "h-3 w-3" })] })] }), _jsx("ul", { className: "divide-y divide-gray-100", children: topCandidates.map((app, i) => {
                                                const score = app.final_score ?? app.resume_score ?? 0;
                                                return (_jsxs("li", { className: "px-6 py-4 flex items-center gap-4", children: [_jsxs("span", { className: "text-xs font-bold text-gray-400 w-4 flex-shrink-0", children: ["#", i + 1] }), _jsx(UserCircle, { className: "h-8 w-8 text-gray-300 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(Link, { to: `/candidates/${app.candidate_id}`, className: "text-sm font-semibold text-blue-700 hover:underline truncate block", children: app.candidate_name }), _jsxs("div", { className: "flex items-center gap-2 mt-1 flex-wrap", children: [_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge(app.stage)}`, children: stageLabel(app.stage) }), app.matched_skills.slice(0, 2).map((s) => (_jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200", children: s }, s)))] })] }), _jsxs("span", { className: `text-sm font-bold px-3 py-1.5 rounded-xl border flex-shrink-0 ${scoreColor(score)}`, children: [score.toFixed(0), "%"] })] }, app.id));
                                            }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-bold text-gray-900", children: "Pipeline Funnel" }), _jsx(Link, { to: "/pipeline", className: "text-xs font-semibold text-blue-600 hover:underline", children: "Open \u2192" })] }), _jsx("div", { className: "p-4 space-y-2", children: stageCounts.map(({ stage, count }) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0 ${stageBadge(stage)}`, children: stageLabel(stage) }), _jsx("div", { className: "flex-1 h-2 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-blue-500 rounded-full transition-all", style: { width: applications.length > 0 ? `${(count / applications.length) * 100}%` : "0%" } }) }), _jsx("span", { className: "text-xs font-bold text-gray-600 w-4 text-right flex-shrink-0", children: count })] }, stage))) })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-bold text-gray-900", children: "Upcoming Interviews" }), _jsx(Link, { to: "/interviews", className: "text-xs font-semibold text-blue-600 hover:underline", children: "View all \u2192" })] }), upcoming.length === 0 ? (_jsxs("div", { className: "p-6 text-center", children: [_jsx(Clock, { className: "h-8 w-8 text-gray-200 mx-auto mb-2" }), _jsx("p", { className: "text-xs text-gray-400", children: "No upcoming interviews" }), _jsx(Link, { to: "/pipeline", className: "mt-2 text-xs font-semibold text-blue-600 hover:underline block", children: "Schedule from Pipeline \u2192" })] })) : (_jsx("ul", { className: "divide-y divide-gray-100", children: upcoming.map((iv) => (_jsxs("li", { className: "px-5 py-3 flex items-center gap-3", children: [_jsx("div", { className: `h-2 w-2 rounded-full flex-shrink-0 ${iv.round_number === 1 ? "bg-amber-400" : "bg-purple-400"}` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "text-xs font-semibold text-gray-800", children: ["Round ", iv.round_number] }), _jsx("p", { className: "text-xs text-gray-400", children: iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—" })] }), _jsx(CheckCircle2, { className: "h-4 w-4 text-blue-400 flex-shrink-0" })] }, iv.id))) }))] })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
                                { to: "/process-resumes", icon: _jsx(FileStack, { className: "h-5 w-5 text-blue-600" }), label: "Add Candidates", desc: "Upload & score resumes", bg: "bg-blue-50" },
                                { to: "/pipeline", icon: _jsx(Users, { className: "h-5 w-5 text-purple-600" }), label: "Hiring Board", desc: "Shortlist, test, interview", bg: "bg-purple-50" },
                                { to: "/interviews", icon: _jsx(Calendar, { className: "h-5 w-5 text-amber-600" }), label: "View Interviews", desc: "Scheduled & completed", bg: "bg-amber-50" },
                            ].map(({ to, icon, label, desc, bg }) => (_jsxs(Link, { to: to, className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group", children: [_jsx("div", { className: `rounded-xl p-3 flex-shrink-0 ${bg}`, children: icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: label }), _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: desc })] }), _jsx(ArrowRight, { className: "h-4 w-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" })] }, to))) })] }))] }) }));
}
