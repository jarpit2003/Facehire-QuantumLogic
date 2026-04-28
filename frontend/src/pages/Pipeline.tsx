import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, Loader2, Send, Calendar,
  XCircle, Award, RefreshCw, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { applicationService, interviewService, type ApplicationRecord, type HRUserRecord } from "../services/api";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";
import { OfferDraftModal } from "../components/OfferDraftModal";
import { CandidateDrawer } from "../components/CandidateDrawer";
import { DndContext, useDroppable, useDraggable, type DragEndEvent } from "@dnd-kit/core";

// ── Stage config ─────────────────────────────────────────────────────────────

const STAGES = [
  { key: "applied",      label: "Applied",      color: "border-t-slate-400",  bg: "bg-slate-50"  },
  { key: "shortlisted",  label: "Shortlisted",  color: "border-t-cyan-400",   bg: "bg-cyan-50"   },
  { key: "test_sent",    label: "Assessment",   color: "border-t-sky-400",    bg: "bg-sky-50"    },
  { key: "interview_1",  label: "Round 1",      color: "border-t-amber-400",  bg: "bg-amber-50"  },
  { key: "interview_2",  label: "Round 2",      color: "border-t-purple-400", bg: "bg-purple-50" },
  { key: "offered",      label: "Offered",      color: "border-t-green-400",  bg: "bg-green-50"  },
  { key: "rejected",     label: "Rejected",     color: "border-t-red-300",    bg: "bg-red-50"    },
] as const;

type Stage = typeof STAGES[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(s: number | null) {
  if (s === null) return "text-gray-400";
  if (s >= 80) return "text-green-700 bg-green-50 border-green-200";
  if (s >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
  if (s >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function scoreBarColor(s: number | null) {
  if (s === null) return "bg-gray-200";
  if (s >= 80) return "bg-green-500";
  if (s >= 60) return "bg-blue-500";
  if (s >= 40) return "bg-amber-500";
  return "bg-red-400";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// ── Reject confirmation modal ─────────────────────────────────────────────────

function RejectConfirmModal({ name, onConfirm, onClose, loading }: {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 rounded-full p-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Reject Candidate?</h2>
        </div>
        <p className="text-sm text-gray-600">
          A rejection email will be sent to <strong>{name}</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {loading ? "Rejecting…" : "Yes, reject & notify"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Test score modal ──────────────────────────────────────────────────────────

function TestScoreModal({
  app,
  onClose,
  onSaved,
}: {
  app: ApplicationRecord;
  onClose: () => void;
  onSaved: (updated: ApplicationRecord) => void;
}) {
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const s = parseFloat(score);
    if (isNaN(s) || s < 0 || s > 100) { setError("Score must be 0–100"); return; }
    setSaving(true);
    setError(null);
    try {
      const { data } = await applicationService.recordTestScore(app.id, s);
      onSaved(data);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to save score"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Enter Test Score</h2>
        <p className="text-sm text-gray-500">Candidate: <strong>{app.candidate_name}</strong></p>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Score (0–100)</label>
          <input
            type="number" min="0" max="100" value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 78"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !score}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
            {saving ? "Saving…" : "Save & re-rank"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Test link modal ───────────────────────────────────────────────────────────

function TestLinkModal({
  app,
  onClose,
  onSent,
}: {
  app: ApplicationRecord;
  onClose: () => void;
  onSent: (updated: ApplicationRecord) => void;
}) {
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!link.trim()) return;
    setSending(true);
    setError(null);
    try {
      const { data } = await applicationService.sendTestLink(app.id, link.trim(), deadline || undefined);
      onSent(data);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to send test link"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Send Assessment Link</h2>
        <p className="text-sm text-gray-600">Sending to <strong>{app.candidate_name}</strong></p>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Test / Assessment URL</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://hackerrank.com/test/..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={sending || !link.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send link"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Schedule interview modal ──────────────────────────────────────────────────

function ScheduleModal({
  app,
  roundNumber,
  onClose,
  onScheduled,
}: {
  app: ApplicationRecord;
  roundNumber: number;
  onClose: () => void;
  onScheduled: (updatedApp: ApplicationRecord) => void;
}) {
  const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState("10:00");
  const [meetLink, setMeetLink] = useState("");
  const [interviewerId, setInterviewerId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hrUsers, setHrUsers] = useState<HRUserRecord[]>([]);

  useEffect(() => {
    interviewService.listHRUsers()
      .then(({ data }) => setHrUsers(data))
      .catch(() => {});
  }, []);

  const handleSchedule = async () => {
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
        interviewer_id: interviewerId || null,
        notes: notes || null,
      });
      const { data: updatedApp } = await applicationService.get(app.id);
      onScheduled(updatedApp);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to schedule interview"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Schedule Round {roundNumber} Interview</h2>
        <p className="text-sm text-gray-600">Candidate: <strong>{app.candidate_name}</strong></p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Interviewer (optional)</label>
          <select
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Select interviewer —</option>
            {hrUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Meet link (optional)</label>
          <input type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSchedule} disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {saving ? "Scheduling…" : "Schedule & notify"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Draggable Candidate card ──────────────────────────────────────────────────

function CandidateCard({
  app,
  selected,
  onSelect,
  onAction,
  onOpenDrawer,
}: {
  app: ApplicationRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onAction: (action: "shortlist" | "test" | "testscore" | "interview1" | "interview2" | "reject" | "offer", app: ApplicationRecord) => void;
  onOpenDrawer: (app: ApplicationRecord) => void;
}) {
  const score = app.final_score ?? app.resume_score;
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: app.id });

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setDragRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      onClick={() => onOpenDrawer(app)}
      className={`bg-white rounded-xl border shadow-sm p-4 space-y-3 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      } ${selected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200"} ${
        score !== null && score >= 80 ? "border-l-4 border-amber-400" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(app.id)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 flex-shrink-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
              score !== null && score >= 80
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            {getInitials(app.candidate_name)}
          </div>
          <div className="min-w-0">
            <Link
              to={`/candidates/${app.candidate_id}`}
              className="text-sm font-semibold text-blue-700 hover:underline truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {app.candidate_name}
            </Link>
            <p className="text-xs text-gray-500 truncate">{app.candidate_email}</p>
          </div>
        </div>
        {score !== null && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${scoreColor(score)}`}>
            {score.toFixed(0)}%
          </span>
        )}
      </div>

      {score !== null && (
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${scoreBarColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}

      {(app.resume_score !== null || app.test_score !== null) && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {app.resume_score !== null && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Resume {app.resume_score.toFixed(0)}%
            </span>
          )}
          {app.test_score !== null && (
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
              Test {app.test_score.toFixed(0)}%
            </span>
          )}
          {app.interview_score !== null && (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
              R1 {app.interview_score.toFixed(0)}%
            </span>
          )}
          {app.hr_interview_score !== null && (
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
              R2 {app.hr_interview_score.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {app.matched_skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {app.matched_skills.slice(0, 3).map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{s}</span>
          ))}
          {app.matched_skills.length > 3 && (
            <span className="text-xs text-gray-400">+{app.matched_skills.length - 3}</span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">Applied {relativeTime(app.applied_at)}</p>

      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
        {app.stage === "applied" && (
          <button onClick={() => onAction("shortlist", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700 hover:bg-cyan-100">
            <CheckCircle2 className="h-3 w-3" /> Shortlist
          </button>
        )}
        {(app.stage === "applied" || app.stage === "shortlisted") && (
          <button onClick={() => onAction("test", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            <Send className="h-3 w-3" /> Send test
          </button>
        )}
        {(app.stage === "test_sent" || app.stage === "tested") && (
          <button onClick={() => onAction("testscore", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-100">
            <Award className="h-3 w-3" /> {app.test_score !== null ? "Update score" : "Enter score"}
          </button>
        )}
        {(app.stage === "applied" || app.stage === "shortlisted" || app.stage === "tested") && (
          <button onClick={() => onAction("interview1", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100">
            <Calendar className="h-3 w-3" /> Round 1
          </button>
        )}
        {app.stage === "interview_1" && (
          <button onClick={() => onAction("interview2", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-100">
            <Calendar className="h-3 w-3" /> Round 2
          </button>
        )}
        {(app.stage === "interview_1" || app.stage === "interview_2") && (
          <button onClick={() => onAction("offer", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100">
            <Award className="h-3 w-3" /> Offer
          </button>
        )}
        {app.stage !== "rejected" && app.stage !== "offered" && (
          <button onClick={() => onAction("reject", app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100">
            <XCircle className="h-3 w-3" /> Reject
          </button>
        )}
      </div>
    </div>
  );
}

// ── Droppable column wrapper ──────────────────────────────────────────────────

function DroppableColumn({
  stageKey,
  children,
}: {
  stageKey: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });
  return (
    <div
      ref={setNodeRef}
      className={`px-2 pb-3 space-y-2 min-h-[120px] rounded-b-2xl transition-colors ${
        isOver ? "ring-2 ring-blue-400 bg-blue-50/40" : ""
      }`}
    >
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const { activeJob } = useJobs();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [showRejected, setShowRejected] = useState(false);
  const [drawerApp, setDrawerApp] = useState<ApplicationRecord | null>(null);
  const [bulkTestModal, setBulkTestModal] = useState(false);

  const [testModal, setTestModal] = useState<ApplicationRecord | null>(null);
  const [testScoreModal, setTestScoreModal] = useState<ApplicationRecord | null>(null);
  const [scheduleModal, setScheduleModal] = useState<{ app: ApplicationRecord; round: number } | null>(null);
  const [offerModal, setOfferModal] = useState<ApplicationRecord | null>(null);
  const [rejectModal, setRejectModal] = useState<ApplicationRecord | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const isRealDbRecord = (app: ApplicationRecord) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.id);

  const load = useCallback(async () => {
    if (!activeJob) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await applicationService.list(activeJob.id);
      setApplications(data);
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load applications"));
    } finally {
      setLoading(false);
    }
  }, [activeJob]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (
    action: "shortlist" | "test" | "testscore" | "interview1" | "interview2" | "reject" | "offer",
    app: ApplicationRecord,
  ) => {
    if (action === "shortlist") {
      if (!isRealDbRecord(app)) { setError("Cannot shortlist — re-run pipeline to persist candidates."); return; }
      try {
        const { data } = await applicationService.shortlist(app.id);
        setApplications((prev) => prev.map((a) => a.id === data.id ? data : a));
      } catch (e) { setError(getApiErrorMessage(e, "Action failed")); }
      return;
    }
    if (action === "test") { setTestModal(app); return; }
    if (action === "testscore") { setTestScoreModal(app); return; }
    if (action === "interview1") { setScheduleModal({ app, round: 1 }); return; }
    if (action === "interview2") { setScheduleModal({ app, round: 2 }); return; }
    if (action === "offer") { setOfferModal(app); return; }
    if (action === "reject") { setRejectModal(app); return; }
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    if (!isRealDbRecord(rejectModal)) {
      setError("This candidate was not saved to the database. Re-run the pipeline to persist candidates.");
      setRejectModal(null);
      return;
    }
    setRejectLoading(true);
    setApplications((prev) => prev.map((a) => a.id === rejectModal.id ? { ...a, stage: "rejected" } : a));
    try {
      await applicationService.reject(rejectModal.id);
    } catch (e) {
      setError(getApiErrorMessage(e, "Action failed"));
      setApplications((prev) => prev.map((a) => a.id === rejectModal.id ? { ...a, stage: rejectModal.stage } : a));
    } finally {
      setRejectLoading(false);
      setRejectModal(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const appId = active.id as string;
    const newStage = over.id as string;
    const app = applications.find(a => a.id === appId);
    if (!app || app.stage === newStage) return;
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    applicationService.advanceStage(appId, newStage).catch(() => {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: app.stage } : a));
      setError("Failed to move candidate. Please try again.");
    });
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectedApps = applications.filter((a) => selected.has(a.id));

  const bulkShortlist = async () => {
    setBulkLoading(true);
    await Promise.allSettled(
      selectedApps.filter(isRealDbRecord).map((a) =>
        applicationService.shortlist(a.id).then(({ data }) =>
          setApplications((prev) => prev.map((x) => x.id === data.id ? data : x))
        )
      )
    );
    setSelected(new Set());
    setBulkLoading(false);
  };

  const bulkReject = async () => {
    setRejectModal({
      ...selectedApps[0],
      candidate_name: `${selectedApps.length} candidate(s)`,
    } as ApplicationRecord);
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (app.stage === "rejected") return false;
      const scoreValue = app.final_score ?? app.resume_score ?? 0;
      if (scoreValue < scoreFilter) return false;
      if (query) {
        const searchable = `${app.candidate_name} ${app.candidate_email}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [applications, searchQuery, scoreFilter]);

  const funnelStages = ["applied", "shortlisted", "test_sent", "interview_1", "offered"] as const;
  const funnelLabels: Record<string, string> = {
    applied: "Applied", shortlisted: "Shortlisted", test_sent: "Assessment",
    interview_1: "Round 1", offered: "Offered",
  };
  const funnelCounts: Record<string, number> = {
    applied: applications.filter((a) => a.stage === "applied").length,
    shortlisted: applications.filter((a) => a.stage === "shortlisted").length,
    test_sent: applications.filter((a) => a.stage === "test_sent" || a.stage === "tested").length,
    interview_1: applications.filter((a) => a.stage === "interview_1").length,
    offered: applications.filter((a) => a.stage === "offered").length,
  };
  const total = applications.length;

  const byStage = (stage: Stage) => {
    const keys = stage === "test_sent" ? ["test_sent", "tested"] : [stage];
    return filteredApplications
      .filter((a) => keys.includes(a.stage))
      .sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0));
  };

  const rejectedApps = applications
    .filter((a) => a.stage === "rejected")
    .sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0));

  const visibleMainStages = STAGES.filter((s) => s.key !== "rejected");

  const canBulkSendTest = selectedApps.some(
    (a) => a.stage === "applied" || a.stage === "shortlisted"
  );

  const bulkTestSyntheticApp: ApplicationRecord = {
    id: "bulk",
    job_id: activeJob?.id ?? "",
    candidate_id: "bulk",
    candidate_name: `${selectedApps.length} candidates`,
    candidate_email: "",
    candidate_phone: null,
    resume_score: null,
    test_score: null,
    interview_score: null,
    hr_interview_score: null,
    final_score: null,
    stage: "applied",
    status: "active",
    matched_skills: [],
    missing_skills: [],
    applied_at: new Date().toISOString(),
    resume_weight: 60,
    test_weight: 40,
  };

  if (!activeJob) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-16">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">No active job</h1>
          <p className="mt-2 text-gray-500">Select a job from the sidebar to view its pipeline.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
            <p className="mt-0.5 text-sm text-gray-500">{activeJob.title} · {applications.length} applicants</p>
          </div>
          <button onClick={load} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Funnel stats bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-0 overflow-x-auto">
          {funnelStages.map((stage, i) => {
            const count = funnelCounts[stage];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={stage} className="flex items-center gap-0 flex-shrink-0">
                <div className="flex flex-col items-center px-4 py-1">
                  <span className="text-xs font-semibold text-gray-500">{funnelLabels[stage]}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                  {i > 0 && (
                    <span className="text-xs text-gray-400">{pct}%</span>
                  )}
                </div>
                {i < funnelStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Search + score filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Search candidates</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or email…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Min score</label>
              <span className="text-xs font-bold text-gray-700">{scoreFilter}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={scoreFilter}
              onChange={(e) => setScoreFilter(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
        )}

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-blue-800">{selected.size} selected</span>
            <button onClick={bulkShortlist} disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Shortlist all
            </button>
            <button
              onClick={() => setBulkTestModal(true)}
              disabled={bulkLoading || !canBulkSendTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send test to all
            </button>
            <button onClick={bulkReject} disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Reject all
            </button>
            <button onClick={() => setSelected(new Set())}
              className="ml-auto text-xs text-blue-600 hover:underline font-medium">Clear</button>
          </div>
        )}

        {loading && applications.length === 0 ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>
        ) : !loading && applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No applications yet for <strong>{activeJob.title}</strong>.</p>
            <Link
              to="/process-resumes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Process Resumes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 items-start">
                {visibleMainStages.map(({ key, label, color, bg }) => {
                  const cards = byStage(key);
                  const realCount = applications.filter((a) => key === "test_sent" ? ["test_sent","tested"].includes(a.stage) : a.stage === key).length;
                  const allSelected = realCount > 0 && applications.filter((a) => key === "test_sent" ? ["test_sent","tested"].includes(a.stage) : a.stage === key).every((a) => selected.has(a.id));
                  return (
                    <div key={key} className={`rounded-2xl border border-gray-200 border-t-4 ${color} ${bg} overflow-hidden`}>
                      <div className="px-3 py-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => {
                              const ids = applications.filter((a) => key === "test_sent" ? ["test_sent","tested"].includes(a.stage) : a.stage === key).map((a) => a.id);
                              setSelected((prev) => {
                                const n = new Set(prev);
                                if (e.target.checked) ids.forEach((id) => n.add(id));
                                else ids.forEach((id) => n.delete(id));
                                return n;
                              });
                            }}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                          {realCount}
                        </span>
                      </div>
                      <DroppableColumn stageKey={key}>
                        {cards.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">Empty</p>
                        ) : (
                          cards.map((app) => (
                            <CandidateCard
                              key={app.id}
                              app={app}
                              selected={selected.has(app.id)}
                              onSelect={toggleSelect}
                              onAction={handleAction}
                              onOpenDrawer={setDrawerApp}
                            />
                          ))
                        )}
                      </DroppableColumn>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejected toggle */}
            <div className="mt-2">
              <button
                onClick={() => setShowRejected((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                {showRejected
                  ? <><ChevronUp className="h-4 w-4" /> Hide Rejected</>
                  : <><ChevronDown className="h-4 w-4" /> Rejected ({rejectedApps.length})</>
                }
              </button>

              {showRejected && (
                <div className="mt-3 overflow-x-auto pb-2">
                  <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 items-start max-w-sm">
                    <div className="rounded-2xl border border-gray-200 border-t-4 border-t-red-300 bg-red-50 overflow-hidden">
                      <div className="px-3 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Rejected</span>
                        <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                          {rejectedApps.length}
                        </span>
                      </div>
                      <DroppableColumn stageKey="rejected">
                        {rejectedApps.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">Empty</p>
                        ) : (
                          rejectedApps.map((app) => (
                            <CandidateCard
                              key={app.id}
                              app={app}
                              selected={selected.has(app.id)}
                              onSelect={toggleSelect}
                              onAction={handleAction}
                              onOpenDrawer={setDrawerApp}
                            />
                          ))
                        )}
                      </DroppableColumn>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DndContext>
        )}
      </div>

      {testScoreModal && (
        <TestScoreModal
          app={testScoreModal}
          onClose={() => setTestScoreModal(null)}
          onSaved={(updated) => {
            setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
            setTestScoreModal(null);
          }}
        />
      )}

      {testModal && (
        <TestLinkModal
          app={testModal}
          onClose={() => setTestModal(null)}
          onSent={(updated) => {
            setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
            setTestModal(null);
          }}
        />
      )}

      {bulkTestModal && (
        <TestLinkModal
          app={bulkTestSyntheticApp}
          onClose={() => setBulkTestModal(false)}
          onSent={async (updated) => {
            const link = (updated as ApplicationRecord & { _link?: string })._link ?? "";
            const deadline = (updated as ApplicationRecord & { _deadline?: string })._deadline;
            setBulkLoading(true);
            await Promise.allSettled(
              selectedApps
                .filter((a) => a.stage === "applied" || a.stage === "shortlisted")
                .map((a) => applicationService.sendTestLink(a.id, link, deadline))
            );
            setBulkTestModal(false);
            setSelected(new Set());
            setBulkLoading(false);
            load();
          }}
        />
      )}

      {scheduleModal && (
        <ScheduleModal
          app={scheduleModal.app}
          roundNumber={scheduleModal.round}
          onClose={() => setScheduleModal(null)}
          onScheduled={(updatedApp) => {
            setApplications((prev) => prev.map((a) => a.id === updatedApp.id ? updatedApp : a));
            setScheduleModal(null);
          }}
        />
      )}

      {offerModal && (
        <OfferDraftModal
          app={offerModal}
          onClose={() => setOfferModal(null)}
          onSent={(updatedApp) => {
            setApplications((prev) => prev.map((a) => a.id === updatedApp.id ? updatedApp : a));
            setOfferModal(null);
          }}
        />
      )}

      {rejectModal && (
        <RejectConfirmModal
          name={rejectModal.candidate_name}
          loading={rejectLoading}
          onConfirm={confirmReject}
          onClose={() => setRejectModal(null)}
        />
      )}

      {drawerApp && (
        <CandidateDrawer
          app={drawerApp}
          onClose={() => setDrawerApp(null)}
          onAction={handleAction}
        />
      )}
    </Layout>
  );
}
