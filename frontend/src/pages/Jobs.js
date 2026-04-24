import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, CheckCircle2, Loader2, ArrowRight, Share2, ExternalLink, Copy, Twitter, Linkedin, FileText, Globe, } from "lucide-react";
import { jobService } from "../services/api";
import { useJobs } from "../context/JobContext";
import { usePipeline } from "../context/PipelineContext";
import { getApiErrorMessage } from "../utils/apiError";
const api_base = "/api/v1";
const PLATFORMS = [
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50  border-blue-200" },
    { id: "naukri", label: "Naukri", icon: Briefcase, color: "text-green-700", bg: "bg-green-50 border-green-200" },
    { id: "x", label: "X / Twitter", icon: Twitter, color: "text-gray-800", bg: "bg-gray-50  border-gray-200" },
    { id: "google_form", label: "Google Form", icon: FileText, color: "text-red-700", bg: "bg-red-50   border-red-200" },
];
function PlatformBadge({ platform }) {
    const p = PLATFORMS.find((x) => x.id === platform);
    if (!p)
        return null;
    const Icon = p.icon;
    return (_jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${p.bg} ${p.color}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", p.label] }));
}
function PublishPanel({ job, onDone }) {
    const [selected, setSelected] = useState(new Set(["linkedin"]));
    const [publishing, setPublishing] = useState(false);
    const [results, setResults] = useState([]);
    const [copied, setCopied] = useState(null);
    const toggle = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const handlePublish = async () => {
        if (selected.size === 0)
            return;
        setPublishing(true);
        setResults([]);
        try {
            const token = localStorage.getItem("fairhire_token");
            const resp = await fetch(`${api_base}/jobs/${job.id}/publish`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ platforms: Array.from(selected) }),
            });
            const data = await resp.json();
            setResults(data.results ?? []);
            onDone();
        }
        catch (e) {
            setResults([{ platform: "error", success: false, url: null, message: String(e) }]);
        }
        finally {
            setPublishing(false);
        }
    };
    const copyText = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };
    return (_jsxs("div", { className: "mt-4 p-5 rounded-xl bg-slate-50 border border-gray-200 space-y-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: "Publish to platforms" }), _jsx("div", { className: "flex flex-wrap gap-2", children: PLATFORMS.map(({ id, label, icon: Icon, color, bg }) => (_jsxs("button", { type: "button", onClick: () => toggle(id), className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selected.has(id)
                        ? `${bg} ${color} ring-2 ring-offset-1 ring-blue-400`
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`, children: [_jsx(Icon, { className: "h-3.5 w-3.5" }), label] }, id))) }), _jsxs("button", { type: "button", onClick: handlePublish, disabled: publishing || selected.size === 0, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [publishing ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Share2, { className: "h-4 w-4" }), publishing ? "Publishing…" : "Publish selected"] }), results.length > 0 && (_jsx("div", { className: "space-y-3", children: results.map((r) => (_jsxs("div", { className: `p-3 rounded-xl border text-sm ${r.success ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PlatformBadge, { platform: r.platform }), _jsx("span", { className: r.success ? "text-green-800" : "text-amber-800", children: r.success ? "Published" : "Not published" })] }), r.url && (_jsxs("a", { href: r.url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline", children: ["Open ", _jsx(ExternalLink, { className: "h-3 w-3" })] }))] }), r.platform === "naukri" && !r.success === false && r.message.length > 50 && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Copy-ready post for Naukri:" }), _jsxs("button", { type: "button", onClick: () => copyText(r.message, "naukri"), className: "inline-flex items-center gap-1 text-xs text-blue-600 hover:underline", children: [_jsx(Copy, { className: "h-3 w-3" }), copied === "naukri" ? "Copied!" : "Copy"] })] }), _jsx("pre", { className: "text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-2 whitespace-pre-wrap max-h-32 overflow-y-auto", children: r.message })] })), r.platform === "x" && !r.success && r.message.includes("Draft tweet") && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Draft tweet (enable X in .env to auto-post):" }), _jsxs("button", { type: "button", onClick: () => copyText(r.message.split("Draft tweet:\n\n")[1] ?? r.message, "x"), className: "inline-flex items-center gap-1 text-xs text-blue-600 hover:underline", children: [_jsx(Copy, { className: "h-3 w-3" }), copied === "x" ? "Copied!" : "Copy"] })] }), _jsx("pre", { className: "text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-2 whitespace-pre-wrap", children: r.message.split("Draft tweet:\n\n")[1] ?? r.message })] })), r.platform === "google_form" && !r.success && (_jsx("p", { className: "mt-1 text-xs text-amber-700", children: r.message }))] }, r.platform))) }))] }));
}
export default function Jobs() {
    const { jobs, activeJob, setActiveJobId, reloadJobs, loading } = useJobs();
    const { setActiveJobId: setPipelineJobId } = usePipeline();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [publishingJobId, setPublishingJobId] = useState(null);
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim())
            return;
        setSaving(true);
        setError(null);
        try {
            const { data } = await jobService.create({ title: title.trim(), description: description.trim() || null });
            setActiveJobId(data.id);
            setPipelineJobId(data.id);
            await reloadJobs();
            setTitle("");
            setDescription("");
            setShowForm(false);
        }
        catch (err) {
            setError(getApiErrorMessage(err, "Failed to create job"));
        }
        finally {
            setSaving(false);
        }
    };
    const handleSelect = (id) => {
        setActiveJobId(id);
        setPipelineJobId(id);
    };
    return (_jsxs("div", { className: "px-4 sm:px-0 space-y-8 max-w-4xl mx-auto", children: [_jsx("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8", children: _jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-3 flex-shrink-0", children: _jsx(Briefcase, { className: "h-8 w-8 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 tracking-tight", children: "Jobs" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Create a job, publish it to LinkedIn / Naukri / X, and collect applications automatically." })] })] }), _jsxs("button", { type: "button", onClick: () => setShowForm((s) => !s), className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "New job"] })] }) }), showForm && (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-5", children: "Create job requisition" }), _jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: "Job title" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), required: true, placeholder: "e.g. Senior Software Engineer", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-900 mb-1.5", children: ["Job description ", _jsx("span", { className: "font-normal text-gray-500", children: "(paste full JD)" })] }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 8, placeholder: "Paste the full job description here\u2026", className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]" })] }), error && (_jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800", children: error })), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { type: "submit", disabled: saving || !title.trim(), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Plus, { className: "h-4 w-4" }), saving ? "Creating…" : "Create & activate"] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Cancel" })] })] })] })), loading && jobs.length === 0 ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 text-blue-600 animate-spin" }) })) : jobs.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "No job requisitions yet." }), _jsxs("button", { type: "button", onClick: () => setShowForm(true), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Create your first job"] })] })) : (_jsx("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden", children: _jsx("ul", { className: "divide-y divide-gray-100", children: jobs.map((job) => {
                        const isActive = job.id === activeJob?.id;
                        const firstLine = job.description?.trim().split("\n").find((l) => l.trim()) ?? "";
                        const published = job.published_platforms ?? [];
                        const isPublishing = publishingJobId === job.id;
                        return (_jsxs("li", { className: `px-6 py-5 ${isActive ? "bg-blue-50/60" : "hover:bg-slate-50"}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [isActive ? (_jsx(CheckCircle2, { className: "h-5 w-5 text-blue-600 flex-shrink-0" })) : (_jsx(Briefcase, { className: "h-5 w-5 text-gray-400 flex-shrink-0" })), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: `text-sm font-semibold truncate ${isActive ? "text-blue-900" : "text-gray-900"}`, children: [job.title, isActive && (_jsx("span", { className: "ml-2 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full", children: "Active" }))] }), firstLine && (_jsx("p", { className: "text-xs text-gray-500 truncate mt-0.5", children: firstLine.slice(0, 100) })), published.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1 mt-1.5", children: published.map((p) => _jsx(PlatformBadge, { platform: p }, p)) })), job.form_url && (_jsxs("a", { href: job.form_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline", children: [_jsx(Globe, { className: "h-3 w-3" }), " Application form", _jsx(ExternalLink, { className: "h-3 w-3" })] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0 flex-wrap", children: [!isActive && (_jsx("button", { type: "button", onClick: () => handleSelect(job.id), className: "px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100", children: "Activate" })), _jsxs("button", { type: "button", onClick: () => setPublishingJobId(isPublishing ? null : job.id), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100", children: [_jsx(Share2, { className: "h-3.5 w-3.5" }), isPublishing ? "Close" : "Publish"] }), _jsxs(Link, { to: "/process-resumes", onClick: () => handleSelect(job.id), className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700", children: ["Process resumes", _jsx(ArrowRight, { className: "h-3.5 w-3.5" })] })] })] }), isPublishing && (_jsx(PublishPanel, { job: job, onDone: () => { reloadJobs(); } }))] }, job.id));
                    }) }) }))] }));
}
