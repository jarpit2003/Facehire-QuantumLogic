import { useCallback, useId, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, FileText, Loader2, UploadCloud, X,
  Briefcase, CheckCircle2, AlertCircle, User, Mail,
  Phone, BookOpen, Award, Edit3, ChevronRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";

const api = "/api/v1";
const ACCEPT_EXT = /\.(pdf|docx?)$/i;
const ACCEPT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isAllowedFile(f: File) {
  return ACCEPT_EXT.test(f.name) || (f.type && ACCEPT_MIME.has(f.type));
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("fairhire_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileSummary {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: string[];
  certifications: string[];
  experience_years: number | null;
}

interface PreviewData {
  filename: string;
  full_text: string;
  profile: ProfileSummary;
  used_gemini_fallback: boolean;
  warning: string | null;
}

interface EditableProfile {
  full_name: string;
  email: string;
  phone: string;
}

interface SavedResult {
  name: string;
  email: string;
  fitScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  status: "saved" | "duplicate" | "error";
  error?: string;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "opacity-100" : "opacity-40"}`}>
      <span className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
        active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
      }`}>{n}</span>
      <span className={`text-sm font-semibold ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile preview card — HR reviews and can edit before confirming
// ---------------------------------------------------------------------------

function ProfilePreviewCard({
  preview,
  editable,
  onChange,
}: {
  preview: PreviewData;
  editable: EditableProfile;
  onChange: (field: keyof EditableProfile, value: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Edit3 className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-bold text-gray-900">Extracted Profile — Review & Edit</h2>
        {preview.used_gemini_fallback && (
          <span className="ml-auto text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
            Gemini fallback used
          </span>
        )}
      </div>

      {preview.warning && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {preview.warning}
        </div>
      )}

      {/* Editable contact fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
            <User className="h-3.5 w-3.5" /> Full Name
          </label>
          <input
            value={editable.full_name}
            onChange={(e) => onChange("full_name", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Candidate name"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </label>
          <input
            value={editable.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="candidate@email.com"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone
          </label>
          <input
            value={editable.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+91 9876543210"
          />
        </div>
      </div>

      {/* Skills */}
      {preview.profile.skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Skills Detected ({preview.profile.skills.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {preview.profile.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {preview.profile.education.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
            <BookOpen className="h-3.5 w-3.5" /> Education
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.profile.education.map((e) => (
              <span key={e} className="px-2 py-0.5 rounded-md text-xs bg-green-50 text-green-700 border border-green-200">{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {preview.profile.certifications.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
            <Award className="h-3.5 w-3.5" /> Certifications
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.profile.certifications.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md text-xs bg-purple-50 text-purple-700 border border-purple-200">{c}</span>
            ))}
          </div>
        </div>
      )}

      {preview.profile.experience_years !== null && (
        <p className="text-xs text-gray-500">
          Experience detected: <strong className="text-gray-800">{preview.profile.experience_years} years</strong>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProcessResumes() {
  const navigate = useNavigate();
  const { activeJob, jobs } = useJobs();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 state
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 state — previews per file
  const [previewing, setPreviewing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previews, setPreviews] = useState<(PreviewData | null)[]>([]);
  const [editables, setEditables] = useState<EditableProfile[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Step 3 state — confirm + save
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<SavedResult[]>([]);
  const [done, setDone] = useState(false);

  const onFilesPicked = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    const next: File[] = [];
    const rejected: string[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (isAllowedFile(f)) next.push(f);
      else rejected.push(f.name);
    }
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => `${p.name}-${p.size}`));
      const merged = [...prev];
      for (const f of next) {
        const key = `${f.name}-${f.size}`;
        if (!seen.has(key)) { seen.add(key); merged.push(f); }
      }
      return merged;
    });
    if (rejected.length) setError(`Skipped (PDF/DOCX only): ${rejected.join(", ")}`);
    else setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesPicked(e.dataTransfer.files);
  }, [onFilesPicked]);

  // Step 1 → Step 2: parse all files and show previews
  const runPreview = async () => {
    if (!activeJob || files.length === 0) return;
    setPreviewing(true);
    setPreviewError(null);
    const newPreviews: (PreviewData | null)[] = [];
    const newEditables: EditableProfile[] = [];

    for (const file of files) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("job_id", activeJob.id);
        const resp = await fetch(`${api}/intake/upload-and-preview`, {
          method: "POST",
          headers: authHeaders(),
          body: form,
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          newPreviews.push(null);
          newEditables.push({ full_name: "", email: "", phone: "" });
          setPreviewError(err.detail || "Failed to parse one or more files");
          continue;
        }
        const data: PreviewData = await resp.json();
        newPreviews.push(data);
        newEditables.push({
          full_name: data.profile.full_name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
        });
      } catch (e) {
        newPreviews.push(null);
        newEditables.push({ full_name: "", email: "", phone: "" });
        setPreviewError(getApiErrorMessage(e, "Failed to parse file"));
      }
    }

    setPreviews(newPreviews);
    setEditables(newEditables);
    setPreviewIndex(0);
    setPreviewing(false);
  };

  const updateEditable = (index: number, field: keyof EditableProfile, value: string) => {
    setEditables((prev) => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  // Step 2 → Step 3: confirm all previews and save
  const confirmAll = async () => {
    if (!activeJob) return;
    setSaving(true);
    const saved: SavedResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const preview = previews[i];
      const editable = editables[i];

      if (!preview) {
        saved.push({ name: files[i].name, email: "", fitScore: null, matchedSkills: [], missingSkills: [], status: "error", error: "File could not be parsed" });
        continue;
      }

      if (!editable.email.trim()) {
        saved.push({ name: editable.full_name || files[i].name, email: "", fitScore: null, matchedSkills: [], missingSkills: [], status: "error", error: "Email is required — please fill it in the preview step" });
        continue;
      }

      try {
        const resp = await fetch(`${api}/intake/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            job_id: activeJob.id,
            full_name: editable.full_name || files[i].name,
            email: editable.email.trim(),
            phone: editable.phone || null,
            resume_text: preview.full_text,
          }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          saved.push({ name: editable.full_name, email: editable.email, fitScore: null, matchedSkills: [], missingSkills: [], status: "error", error: data.detail || "Save failed" });
          continue;
        }
        saved.push({
          name: editable.full_name,
          email: editable.email,
          fitScore: data.resume_score,
          matchedSkills: data.matched_skills || [],
          missingSkills: data.missing_skills || [],
          status: data.message?.includes("Duplicate") ? "duplicate" : "saved",
        });
      } catch (e) {
        saved.push({ name: editable.full_name, email: editable.email, fitScore: null, matchedSkills: [], missingSkills: [], status: "error", error: getApiErrorMessage(e, "Save failed") });
      }
    }

    setResults(saved);
    setSaving(false);
    setDone(true);
  };

  const reset = () => {
    setFiles([]); setPreviews([]); setEditables([]);
    setResults([]); setDone(false); setError(null);
    setPreviewError(null); setPreviewIndex(0);
  };

  const isPreviewStep = previews.length > 0 && !done;
  const currentPreview = previews[previewIndex];

  if (jobs.length === 0) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
            <div className="bg-blue-50 rounded-2xl p-4 inline-flex mb-5">
              <Briefcase className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">No job created yet</h1>
            <p className="mt-2 text-sm text-gray-500">Create a job first, then come back to upload resumes.</p>
            <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Create a job <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
              <UploadCloud className="h-7 w-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Process Resumes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload → Review extracted profile → Confirm → Saved to Pipeline
              </p>
              {activeJob && (
                <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                  <Briefcase className="h-3 w-3" /> {activeJob.title}
                </span>
              )}
            </div>
          </div>

          {/* Step indicators */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <StepBadge n={1} label="Upload Files" active={!isPreviewStep && !done} />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <StepBadge n={2} label="Review Profile" active={isPreviewStep} />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <StepBadge n={3} label="Saved to Pipeline" active={done} />
          </div>
        </div>

        {!activeJob && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            No active job selected. <Link to="/jobs" className="font-semibold underline ml-1">Select a job →</Link>
          </div>
        )}

        {/* ── STEP 1: Upload ── */}
        {!isPreviewStep && !done && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => { onFilesPicked(e.target.files); e.target.value = ""; }}
              disabled={previewing}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <UploadCloud className={`h-8 w-8 ${isDragging ? "text-blue-500" : "text-gray-300"}`} />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Drop resumes here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — multiple files supported</p>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={previewing}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

            <button
              type="button"
              onClick={runPreview}
              disabled={previewing || files.length === 0 || !activeJob}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {previewing ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing resumes…</> : <><ArrowRight className="h-4 w-4" /> Parse & Preview</>}
            </button>
          </div>
        )}

        {/* ── STEP 2: Preview + Edit ── */}
        {isPreviewStep && (
          <>
            {/* File tabs */}
            {files.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {files.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      previewIndex === i
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f.name.length > 20 ? f.name.slice(0, 20) + "…" : f.name}
                    {previews[i] === null && <span className="ml-1 text-red-400">⚠</span>}
                  </button>
                ))}
              </div>
            )}

            {previewError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{previewError}</div>
            )}

            {currentPreview ? (
              <ProfilePreviewCard
                preview={currentPreview}
                editable={editables[previewIndex]}
                onChange={(field, value) => updateEditable(previewIndex, field, value)}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 text-center">
                Could not parse <strong>{files[previewIndex]?.name}</strong>. This file will be skipped.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmAll}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 shadow-sm"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Confirm & Save to Pipeline</>}
              </button>
              <button
                onClick={reset}
                disabled={saving}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Start Over
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Results ── */}
        {done && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                <p className="text-sm font-semibold text-gray-900">
                  Results — {results.filter((r) => r.status === "saved").length} saved,{" "}
                  {results.filter((r) => r.status === "duplicate").length} duplicate,{" "}
                  {results.filter((r) => r.status === "error").length} failed
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {results.map((r, i) => (
                  <li key={i} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {r.status === "saved" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {r.status === "duplicate" && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
                      {r.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        {r.status === "saved" && r.fitScore !== null && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Score: {r.fitScore.toFixed(0)}%
                          </span>
                        )}
                        {r.status === "duplicate" && (
                          <span className="text-xs font-medium text-amber-600">Already applied</span>
                        )}
                        {r.status === "error" && (
                          <span className="text-xs text-red-600">{r.error}</span>
                        )}
                      </div>
                      {r.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.matchedSkills.slice(0, 5).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{s}</span>
                          ))}
                          {r.matchedSkills.length > 5 && <span className="text-xs text-gray-400">+{r.matchedSkills.length - 5} more</span>}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pb-8">
              <button
                onClick={() => navigate("/pipeline")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm"
              >
                <ArrowRight className="h-4 w-4" /> View Pipeline
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Process More Resumes
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
