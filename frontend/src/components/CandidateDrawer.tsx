import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  X, UserCircle, Mail, Phone, ArrowRight,
  CheckCircle2, Send, Award, Calendar, XCircle, Sparkles,
} from "lucide-react";
import type { ApplicationRecord } from "../services/api";

function scoreColor(s: number) {
  if (s >= 80) return "text-green-700 bg-green-50 border-green-200";
  if (s >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
  if (s >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${scoreColor(value)}`}>
          {value.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const STAGE_TIMELINE: Record<string, { label: string; color: string }> = {
  applied:      { label: "Applied",      color: "bg-slate-400"  },
  shortlisted:  { label: "Shortlisted",  color: "bg-cyan-500"   },
  test_sent:    { label: "Test Sent",    color: "bg-sky-500"    },
  tested:       { label: "Assessed",     color: "bg-blue-500"   },
  interview_1:  { label: "Round 1",      color: "bg-amber-500"  },
  interview_2:  { label: "Round 2",      color: "bg-purple-500" },
  offered:      { label: "Offered",      color: "bg-green-500"  },
  rejected:     { label: "Rejected",     color: "bg-red-400"    },
};

const STAGE_ORDER = ["applied","shortlisted","test_sent","tested","interview_1","interview_2","offered"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export function CandidateDrawer({
  app,
  onClose,
  onAction,
}: {
  app: ApplicationRecord;
  onClose: () => void;
  onAction: (
    action: "shortlist" | "test" | "testscore" | "interview1" | "interview2" | "reject" | "offer",
    app: ApplicationRecord
  ) => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const finalScore = app.final_score ?? app.resume_score;
  const currentStageIdx = STAGE_ORDER.indexOf(app.stage);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => window.addEventListener("mousedown", handler), 0);
    return () => window.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-[1px]" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
        style={{ animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className={`h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white ${finalScore !== null && finalScore >= 80 ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
            {getInitials(app.candidate_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{app.candidate_name}</h2>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 flex-shrink-0" /> {app.candidate_email}
            </p>
            {app.candidate_phone && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3 flex-shrink-0" /> {app.candidate_phone}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Applied date + final score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Applied {relativeTime(app.applied_at)}</span>
            {finalScore !== null && (
              <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${scoreColor(finalScore)}`}>
                {finalScore.toFixed(0)}% Final
              </span>
            )}
          </div>

          {/* Score breakdown */}
          {(app.resume_score !== null || app.test_score !== null || app.interview_score !== null || app.hr_interview_score !== null) && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score Breakdown</p>
              {app.resume_score !== null && (
                <ScoreBar label="Resume Score" value={app.resume_score} color="bg-blue-500" />
              )}
              {app.test_score !== null && (
                <ScoreBar label="Assessment Score" value={app.test_score} color="bg-sky-500" />
              )}
              {app.interview_score !== null && (
                <ScoreBar label="Round 1 Interview" value={app.interview_score} color="bg-amber-500" />
              )}
              {app.hr_interview_score !== null && (
                <ScoreBar label="Round 2 Interview" value={app.hr_interview_score} color="bg-purple-500" />
              )}
            </div>
          )}

          {/* Matched skills */}
          {app.matched_skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {app.matched_skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-green-50 text-green-700 border border-green-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {app.missing_skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {app.missing_skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-600 border border-red-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stage timeline */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pipeline Progress</p>
            <div className="space-y-2">
              {app.stage === "rejected" ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-red-600">Rejected</span>
                </div>
              ) : (
                STAGE_ORDER.map((s, i) => {
                  const done = i < currentStageIdx;
                  const current = i === currentStageIdx;
                  const info = STAGE_TIMELINE[s];
                  return (
                    <div key={s} className="flex items-center gap-2.5">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${current ? info.color : done ? "bg-gray-300" : "bg-gray-100 border border-gray-200"}`} />
                      <span className={`text-xs ${current ? "font-bold text-gray-900" : done ? "text-gray-400 line-through" : "text-gray-300"}`}>
                        {info.label}
                      </span>
                      {current && (
                        <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          {app.stage !== "rejected" && app.stage !== "offered" && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {app.stage === "applied" && (
                  <button
                    onClick={() => { onAction("shortlist", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Shortlist
                  </button>
                )}
                {(app.stage === "applied" || app.stage === "shortlisted") && (
                  <button
                    onClick={() => { onAction("test", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Test
                  </button>
                )}
                {(app.stage === "test_sent" || app.stage === "tested") && (
                  <button
                    onClick={() => { onAction("testscore", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    <Award className="h-3.5 w-3.5" /> Enter Score
                  </button>
                )}
                {(app.stage === "applied" || app.stage === "shortlisted" || app.stage === "tested") && (
                  <button
                    onClick={() => { onAction("interview1", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Round 1
                  </button>
                )}
                {app.stage === "interview_1" && (
                  <button
                    onClick={() => { onAction("interview2", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Round 2
                  </button>
                )}
                {(app.stage === "interview_1" || app.stage === "interview_2") && (
                  <button
                    onClick={() => { onAction("offer", app); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Send Offer
                  </button>
                )}
                <button
                  onClick={() => { onAction("reject", app); onClose(); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <Link
            to={`/candidates/${app.candidate_id}`}
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <UserCircle className="h-4 w-4" /> Open Full Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
