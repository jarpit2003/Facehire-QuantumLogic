import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, ArrowRight, UserCircle, CheckCircle2,
  Loader2, RefreshCw, Star, GitBranch, User,
} from "lucide-react";
import { interviewService, type InterviewRecord } from "../services/api";
import { useJobs } from "../context/JobContext";
import { getApiErrorMessage } from "../utils/apiError";
import Layout from "../components/Layout";

function roundBadge(n: number) {
  const map: Record<number, string> = {
    1: "bg-amber-50 text-amber-800 border-amber-200",
    2: "bg-purple-50 text-purple-800 border-purple-200",
  };
  return map[n] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function statusBadge(s: string) {
  if (s === "completed") return "bg-green-100 text-green-800 border-green-200";
  if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  return "bg-blue-50 text-blue-800 border-blue-200";
}

function ScoreModal({
  interview,
  onClose,
  onSaved,
}: {
  interview: InterviewRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [score, setScore] = useState(interview.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(interview.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const s = parseFloat(score);
    if (isNaN(s) || s < 0 || s > 100) { setError("Score must be 0–100"); return; }
    setSaving(true);
    setError(null);
    try {
      await interviewService.submitScore(interview.id, s, feedback || undefined);
      onSaved();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to save score"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Submit Interview Score</h2>
        <p className="text-sm text-gray-500">Round {interview.round_number} · {new Date(interview.scheduled_at ?? "").toLocaleDateString()}</p>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Score (0–100)</label>
          <input
            type="number" min="0" max="100" value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Feedback (optional)</label>
          <textarea
            value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4}
            placeholder="Technical skills, communication, culture fit…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            {saving ? "Saving…" : "Save score"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Interviews() {
  const { activeJob } = useJobs();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<InterviewRecord | null>(null);

  const load = useCallback(async () => {
    if (!activeJob) return;
    setLoading(true);
    setError(null);
    try {
      const { data: ivs } = await interviewService.list(activeJob.id);
      setInterviews(ivs);
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load interviews"));
    } finally {
      setLoading(false);
    }
  }, [activeJob]);

  useEffect(() => { load(); }, [load]);

  const scheduled = interviews.filter((i) => i.status === "scheduled");
  const completed = interviews.filter((i) => i.status === "completed");

  if (!activeJob) {
    return (
      <Layout>
        <div className="px-4 sm:px-0 max-w-2xl mx-auto text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">No active job</h1>
          <p className="mt-2 text-gray-500">Select a job from the navbar to view its interviews.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
              <p className="mt-1 text-sm text-gray-500">
                {activeJob.title} · {interviews.length} total · {scheduled.length} upcoming
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/pipeline"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <GitBranch className="h-4 w-4" /> Pipeline
              </Link>
              <button onClick={load} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>}

        {loading && interviews.length === 0 ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-10 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No interviews scheduled yet for this job.</p>
            <Link to="/pipeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Go to Pipeline <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {scheduled.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/40 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-900">Upcoming</h2>
                  <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{scheduled.length}</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {scheduled.map((iv) => (
                    <InterviewRow key={iv.id} iv={iv} onScore={() => setScoreModal(iv)} />
                  ))}
                </ul>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-green-50/40 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h2 className="text-base font-semibold text-gray-900">Completed</h2>
                  <span className="ml-auto text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">{completed.length}</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {completed.map((iv) => (
                    <InterviewRow key={iv.id} iv={iv} onScore={() => setScoreModal(iv)} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {scoreModal && (
        <ScoreModal
          interview={scoreModal}
          onClose={() => setScoreModal(null)}
          onSaved={() => { load(); setScoreModal(null); }}
        />
      )}
    </Layout>
  );
}

function InterviewRow({ iv, onScore }: { iv: InterviewRecord; onScore: () => void }) {
  const date = iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : "—";
  return (
    <li className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <UserCircle className="h-9 w-9 text-gray-300 flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/candidates/${iv.candidate_id}`}
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              {iv.candidate_name || "Unknown Candidate"}
            </Link>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roundBadge(iv.round_number)}`}>
              Round {iv.round_number}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(iv.status)}`}>
              {iv.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{date}</p>
          {iv.interviewer_name && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <User className="h-3 w-3" /> {iv.interviewer_name}
            </p>
          )}
          {iv.meet_link && (
            <a href={iv.meet_link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-0.5 block truncate max-w-xs">
              {iv.meet_link}
            </a>
          )}
          {iv.score !== null && (
            <p className="text-xs font-semibold text-green-700 mt-1">Score: {iv.score}/100</p>
          )}
          {iv.feedback && (
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm italic">"{iv.feedback}"</p>
          )}
        </div>
      </div>
      <button onClick={onScore}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 flex-shrink-0">
        <Star className="h-3.5 w-3.5" />
        {iv.score !== null ? "Update score" : "Submit score"}
      </button>
    </li>
  );
}
