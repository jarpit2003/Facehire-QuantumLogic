import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, FileText, Loader2, UploadCloud, X, Briefcase, CheckCircle2, AlertCircle, } from "lucide-react";
import Layout from "../components/Layout";
import { useJobs } from "../context/JobContext";
import { uploadService, matchService, applicationService, candidateService } from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
import { displayNameFromFilename, makeCandidateId } from "../utils/resumeFilename";
const ACCEPT_EXT = /\.(pdf|docx?)$/i;
const ACCEPT_MIME = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
function isAllowedFile(file) {
    return ACCEPT_EXT.test(file.name) || (file.type && ACCEPT_MIME.has(file.type));
}
export default function ProcessResumes() {
    const navigate = useNavigate();
    const { activeJob, jobs } = useJobs();
    const inputId = useId();
    const fileInputRef = useRef(null);
    const [jobDescription, setJobDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState("");
    const [currentFile, setCurrentFile] = useState(0);
    const [results, setResults] = useState([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);
    // Pre-fill JD from active job
    useEffect(() => {
        if (activeJob?.description)
            setJobDescription(activeJob.description);
    }, [activeJob?.id]); // eslint-disable-line react-hooks/exhaustive-deps
    const onFilesPicked = useCallback((list) => {
        if (!list?.length)
            return;
        const next = [];
        const rejected = [];
        for (let i = 0; i < list.length; i++) {
            const f = list[i];
            if (isAllowedFile(f))
                next.push(f);
            else
                rejected.push(f.name);
        }
        setFiles((prev) => {
            const seen = new Set(prev.map((p) => `${p.name}-${p.size}`));
            const merged = [...prev];
            for (const f of next) {
                const key = `${f.name}-${f.size}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(f);
                }
            }
            return merged;
        });
        if (rejected.length)
            setError(`Skipped (PDF/DOCX only): ${rejected.join(", ")}`);
        else
            setError(null);
    }, []);
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        onFilesPicked(e.dataTransfer.files);
    }, [onFilesPicked]);
    const runPipeline = async () => {
        if (!activeJob)
            return;
        setIsRunning(true);
        setDone(false);
        setResults([]);
        setError(null);
        const processed = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setCurrentFile(i + 1);
            setCurrentStep(`Parsing resume: ${file.name}`);
            try {
                // Step 1: Upload & parse resume
                const { data: upload } = await uploadService.resume(file);
                if (!upload.profile_summary) {
                    processed.push({ name: file.name, email: "", fitScore: 0, matchedSkills: [], missingSkills: [], status: "error", error: "Could not extract profile from resume" });
                    continue;
                }
                const profile = upload.profile_summary;
                const displayName = profile.full_name || displayNameFromFilename(upload.filename || file.name);
                const email = profile.email || `${makeCandidateId(file.name, i)}@fairhire.local`;
                setCurrentStep(`Scoring ${displayName} against job description…`);
                // Step 2: AI match scoring
                const { data: match } = await matchService.matchJd({
                    job_description: jobDescription.trim(),
                    candidate_profile: {
                        skills: profile.skills ?? [],
                        education: profile.education ?? [],
                        certifications: profile.certifications ?? [],
                        experience_years: profile.experience_years ?? null,
                        resume_text: upload.extracted_text_preview,
                    },
                });
                setCurrentStep(`Saving ${displayName} to database…`);
                // Step 3: Save candidate to DB with real resume text
                let candidateId;
                try {
                    const { data: candidate } = await candidateService.create({
                        full_name: displayName,
                        email,
                        phone: profile.phone ?? null,
                        resume_text: upload.extracted_text_preview || null,
                    });
                    candidateId = candidate.id;
                }
                catch {
                    // Candidate already exists — fetch by email
                    const { data: allCandidates } = await candidateService.list();
                    const existing = allCandidates.find((c) => c.email === email);
                    if (!existing) {
                        processed.push({ name: displayName, email, fitScore: match.fit_score, matchedSkills: match.matched_skills, missingSkills: match.missing_skills, status: "error", error: "Could not save candidate" });
                        continue;
                    }
                    candidateId = existing.id;
                }
                // Step 4: Create application with scores
                try {
                    await applicationService.create({
                        job_id: activeJob.id,
                        candidate_id: candidateId,
                        resume_score: match.fit_score,
                        matched_skills: match.matched_skills,
                        missing_skills: match.missing_skills,
                    });
                    processed.push({ name: displayName, email, fitScore: match.fit_score, matchedSkills: match.matched_skills, missingSkills: match.missing_skills, status: "saved" });
                }
                catch {
                    // Duplicate application
                    processed.push({ name: displayName, email, fitScore: match.fit_score, matchedSkills: match.matched_skills, missingSkills: match.missing_skills, status: "duplicate" });
                }
            }
            catch (e) {
                processed.push({ name: file.name, email: "", fitScore: 0, matchedSkills: [], missingSkills: [], status: "error", error: getApiErrorMessage(e, "Processing failed") });
            }
            setResults([...processed]);
        }
        setIsRunning(false);
        setDone(true);
        setCurrentStep("");
    };
    if (jobs.length === 0) {
        return (_jsx(Layout, { children: _jsx("div", { className: "max-w-lg mx-auto mt-16 text-center", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-10", children: [_jsx("div", { className: "bg-blue-50 rounded-2xl p-4 inline-flex mb-5", children: _jsx(Briefcase, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "No job created yet" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Create a job first, then come back to upload resumes." }), _jsxs(Link, { to: "/jobs", className: "mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: ["Create a job ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] }) }) }));
    }
    return (_jsx(Layout, { children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-0 space-y-6", children: [_jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "bg-blue-50 rounded-xl p-3 flex-shrink-0", children: _jsx(UploadCloud, { className: "h-7 w-7 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Process Resumes" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Upload resumes \u2192 AI parses & scores each one \u2192 saved directly to Pipeline" }), activeJob && (_jsxs("span", { className: "mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800", children: [_jsx(Briefcase, { className: "h-3 w-3" }), " ", activeJob.title] }))] })] }) }), !activeJob && (_jsxs("div", { className: "p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-center gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0" }), "No active job selected. ", _jsx(Link, { to: "/jobs", className: "font-semibold underline ml-1", children: "Select a job \u2192" })] })), _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0", children: "1" }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: "Job Description" }), activeJob?.description && _jsx("span", { className: "text-xs text-green-600 font-medium", children: "\u2713 Auto-filled from active job" })] }), _jsx("textarea", { id: inputId, value: jobDescription, onChange: (e) => setJobDescription(e.target.value), rows: 6, placeholder: "Paste the full job description here\u2026", disabled: isRunning, className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px] disabled:opacity-60" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0", children: "2" }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: "Upload Resumes" }), _jsx("span", { className: "text-xs text-gray-400", children: "PDF, DOC, DOCX" })] }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: ".pdf,.doc,.docx", className: "hidden", onChange: (e) => { onFilesPicked(e.target.files); e.target.value = ""; }, disabled: isRunning }), _jsxs("div", { onDragOver: (e) => { e.preventDefault(); setIsDragging(true); }, onDragLeave: () => setIsDragging(false), onDrop: onDrop, onClick: () => fileInputRef.current?.click(), className: `flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-slate-50"}`, children: [_jsx(UploadCloud, { className: `h-8 w-8 ${isDragging ? "text-blue-500" : "text-gray-300"}` }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Drop resumes here or click to browse" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "PDF, DOC, DOCX \u2014 multiple files supported" })] })] }), files.length > 0 && (_jsx("ul", { className: "space-y-2", children: files.map((file, i) => (_jsxs("li", { className: "flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx(FileText, { className: "h-4 w-4 text-blue-500 flex-shrink-0" }), _jsx("span", { className: "text-sm font-medium text-gray-800 truncate", children: file.name }), _jsxs("span", { className: "text-xs text-gray-400 flex-shrink-0", children: [(file.size / 1024).toFixed(0), " KB"] })] }), _jsx("button", { type: "button", onClick: () => setFiles((prev) => prev.filter((_, idx) => idx !== i)), disabled: isRunning, className: "p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40", children: _jsx(X, { className: "h-4 w-4" }) })] }, `${file.name}-${i}`))) })), error && _jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3", children: error })] }), isRunning && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Loader2, { className: "h-5 w-5 text-blue-600 animate-spin flex-shrink-0" }), _jsx("p", { className: "text-sm font-semibold text-blue-900", children: currentStep })] }), _jsx("div", { className: "h-2 bg-blue-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-blue-600 rounded-full transition-all duration-500", style: { width: `${files.length > 0 ? (currentFile / files.length) * 100 : 0}%` } }) }), _jsxs("p", { className: "text-xs text-blue-700 mt-2", children: [currentFile, " of ", files.length, " resumes"] })] })), results.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-100 bg-slate-50", children: _jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Processing Results" }) }), _jsx("ul", { className: "divide-y divide-gray-100", children: results.map((r, i) => (_jsxs("li", { className: "px-6 py-4 flex items-start gap-4", children: [_jsxs("div", { className: "flex-shrink-0 mt-0.5", children: [r.status === "saved" && _jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" }), r.status === "duplicate" && _jsx(CheckCircle2, { className: "h-5 w-5 text-amber-400" }), r.status === "error" && _jsx(AlertCircle, { className: "h-5 w-5 text-red-500" })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: r.name }), r.status === "saved" && (_jsxs("span", { className: "text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200", children: ["Score: ", r.fitScore.toFixed(0), "%"] })), r.status === "duplicate" && (_jsx("span", { className: "text-xs font-medium text-amber-600", children: "Already applied" })), r.status === "error" && (_jsx("span", { className: "text-xs text-red-600", children: r.error }))] }), r.matchedSkills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [r.matchedSkills.slice(0, 5).map((s) => (_jsx("span", { className: "px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200", children: s }, s))), r.matchedSkills.length > 5 && _jsxs("span", { className: "text-xs text-gray-400", children: ["+", r.matchedSkills.length - 5, " more"] })] }))] })] }, i))) })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pb-8", children: [!done ? (_jsx("button", { type: "button", onClick: runPipeline, disabled: isRunning || files.length === 0 || jobDescription.trim().length < 10 || !activeJob, className: "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm", children: isRunning ? _jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), " Processing\u2026"] }) : _jsxs(_Fragment, { children: [_jsx(UploadCloud, { className: "h-4 w-4" }), " Run Pipeline"] }) })) : (_jsxs("button", { type: "button", onClick: () => navigate("/pipeline"), className: "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm", children: [_jsx(ArrowRight, { className: "h-4 w-4" }), " View Pipeline \u2192"] })), done && (_jsx("button", { type: "button", onClick: () => { setFiles([]); setResults([]); setDone(false); }, className: "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Process More Resumes" }))] })] }) }));
}
