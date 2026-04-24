import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Briefcase, Calendar, TrendingUp, ArrowRight,
  RefreshCw, Loader2, CheckCircle2, Clock, FileStack,
  Award, Plus, ChevronRight, AlertCircle, Sparkles,
} from "lucide-react";
import Layout from "../components/Layout";
import { applicationService, interviewService, type ApplicationRecord, type InterviewRecord } from "../services/api";
import { useJobs } from "../context/JobContext";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";

function scoreColor(s: number) {
  if (s >= 80) return "text-green-700 bg-green-50 border-green-200";
  if (s >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
  if (s >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function stageBadge(stage: string) {
  const map: Record<string, string> = {
    applied: "bg-slate-100 text-slate-600",
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

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    applied: "Applied", shortlisted: "Shortlisted", test_sent: "Test Sent",
    tested: "Assessed", interview_1: "Round 1", interview_2: "Round 2",
    offered: "Offered", rejected: "Rejected",
  };
  return map[stage] ?? stage;
}

function OnboardingStepper({ hasJob, hasCandidates, hasInterview }: {
  hasJob: boolean; hasCandidates: boolean; hasInterview: boolean;
}) {
  const steps = [
    { num: 1, done: hasJob, title: "Create your first job", desc: "Add a job title and description.", action: { label: "Create job", to: "/jobs" } },
    { num: 2, done: hasCandidates, title: "Upload & score resumes", desc: "AI ranks candidates automatically.", action: { label: "Add candidates", to: "/candidates" } },
    { num: 3, done: hasInterview, title: "Schedule your first interview", desc: "Shortlist top candidates and interview.", action: { label: "View candidates", to: "/candidates" } },
  ];
  const currentStep = steps.findIndex((s) => !s.done);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-blue-50 rounded-xl p-2"><Sparkles className="h-5 w-5 text-blue-600" /></div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Get started with FairHire AI</h2>
          <p className="text-xs text-gray-500 mt-0.5">Complete these steps to set up your hiring pipeline</p>
        </div>
        <div className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {steps.filter((s) => s.done).length}/{steps.length} done
        </div>
      </div>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          return (
            <div key={step.num} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${step.done ? "bg-green-50 border-green-200" : isActive ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200 opacity-60"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${step.done ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.num}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${step.done ? "text-green-800 line-through" : "text-gray-900"}`}>{step.title}</p>
                {!step.done && <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>}
              </div>
              {!step.done && isActive && (
                <Link to={step.action.to} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex-shrink-0">
                  {step.action.label} <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color }: { label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string; }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { activeJob, jobs } = useJobs();
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeJob) return;
    setLoading(true); setError(null);
    try {
      const [{ data: apps }, { data: ivs }] = await Promise.all([
        applicationService.list(activeJob.id),
        interviewService.list(activeJob.id),
      ]);
      setApplications(apps); setInterviews(ivs);
    } catch (e) { setError(getApiErrorMessage(e, "Failed to load dashboard")); }
    finally { setLoading(false); }
  }, [activeJob]);

  useEffect(() => { load(); }, [load]);

  const active = applications.filter((a) => a.stage !== "rejected");
  const avgScore = active.length > 0 ? Math.round(active.reduce((s, a) => s + (a.final_score ?? a.resume_score ?? 0), 0) / active.length) : 0;
  const interviewReady = active.filter((a) => (a.final_score ?? a.resume_score ?? 0) >= 70).length;
  const upcomingCount = interviews.filter((i) => i.status === "scheduled").length;
  const offeredCount = applications.filter((a) => a.stage === "offered").length;

  const topCandidates = [...active]
    .sort((a, b) => (b.final_score ?? b.resume_score ?? 0) - (a.final_score ?? a.resume_score ?? 0))
    .slice(0, 5);

  const FUNNEL_STAGES = ["applied", "shortlisted", "tested", "interview_1", "interview_2", "offered"];
  const stageCounts = FUNNEL_STAGES.map((s) => ({ stage: s, count: applications.filter((a) => a.stage === s).length }));

  const upcoming = interviews.filter((i) => i.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled_at ?? "").getTime() - new Date(b.scheduled_at ?? "").getTime())
    .slice(0, 3);

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  const showOnboarding = jobs.length === 0 || !applications.length || !interviews.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">{activeJob ? `Viewing: ${activeJob.title}` : "Select a job from the sidebar to get started"}</p>
          </div>
          <div className="flex gap-2">
            {activeJob && (
              <Link to="/candidates" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                <Users className="h-4 w-4" /> View Candidates
              </Link>
            )}
            {activeJob && (
              <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}

        {/* Onboarding */}
        {showOnboarding && (
          <OnboardingStepper hasJob={jobs.length > 0} hasCandidates={applications.length > 0} hasInterview={interviews.length > 0} />
        )}

        {/* No active job */}
        {!activeJob && jobs.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">Select a job from the sidebar switcher to see its dashboard.</p>
          </div>
        )}

        {activeJob && (
          <>
            {loading && applications.length === 0 ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <FileStack className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-900">No candidates yet</h2>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Upload resumes for <strong>{activeJob.title}</strong> to start AI scoring.</p>
                <Link to="/candidates" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                  <Plus className="h-4 w-4" /> Add Candidates
                </Link>
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard label="Total Applicants" value={applications.length} sub={`${active.length} active`} color="bg-blue-50" icon={<Users className="h-6 w-6 text-blue-600" />} />
                  <MetricCard label="Avg AI Score" value={`${avgScore}%`} sub={avgScore >= 60 ? "Good talent pool" : "Consider more sourcing"} color="bg-indigo-50" icon={<TrendingUp className="h-6 w-6 text-indigo-600" />} />
                  <MetricCard label="Interview Ready" value={interviewReady} sub="Score ≥ 70%" color="bg-green-50" icon={<Award className="h-6 w-6 text-green-600" />} />
                  <MetricCard label="Upcoming Interviews" value={upcomingCount} sub={offeredCount > 0 ? `${offeredCount} offer(s) sent` : "No offers yet"} color="bg-amber-50" icon={<Calendar className="h-6 w-6 text-amber-600" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top candidates */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-gray-900">Top Candidates</h2>
                      <Link to="/candidates" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {topCandidates.map((app, i) => {
                        const score = app.final_score ?? app.resume_score ?? 0;
                        return (
                          <li key={app.id} className="px-6 py-3.5 flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <Link to={`/candidates/${app.candidate_id}`} className="text-sm font-semibold text-blue-700 hover:underline truncate block">{app.candidate_name}</Link>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge(app.stage)}`}>{stageLabel(app.stage)}</span>
                                {app.matched_skills.slice(0, 2).map((s) => (
                                  <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">{s}</span>
                                ))}
                              </div>
                            </div>
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-xl border flex-shrink-0 ${scoreColor(score)}`}>{score.toFixed(0)}%</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Right column */}
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Hiring Funnel</h2>
                        <Link to="/candidates" className="text-xs font-semibold text-blue-600 hover:underline">Manage →</Link>
                      </div>
                      <div className="p-4 space-y-2">
                        {stageCounts.map(({ stage, count }) => (
                          <div key={stage} className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0 ${stageBadge(stage)}`}>{stageLabel(stage)}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: applications.length > 0 ? `${(count / applications.length) * 100}%` : "0%" }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 w-4 text-right flex-shrink-0">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Upcoming Interviews</h2>
                        <Link to="/interviews" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>
                      </div>
                      {upcoming.length === 0 ? (
                        <div className="p-6 text-center">
                          <Clock className="h-7 w-7 text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">No upcoming interviews</p>
                          <Link to="/candidates" className="mt-2 text-xs font-semibold text-blue-600 hover:underline block">Schedule from Candidates →</Link>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {upcoming.map((iv) => (
                            <li key={iv.id} className="px-5 py-3 flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${iv.round_number === 1 ? "bg-amber-400" : "bg-purple-400"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800">Round {iv.round_number}</p>
                                <p className="text-xs text-gray-400">{iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}</p>
                              </div>
                              <CheckCircle2 className="h-4 w-4 text-blue-300 flex-shrink-0" />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { to: "/candidates", icon: <FileStack className="h-5 w-5 text-blue-600" />, label: "Add Candidates", desc: "Upload & score resumes", bg: "bg-blue-50" },
                    { to: "/candidates", icon: <Users className="h-5 w-5 text-purple-600" />, label: "Review Pipeline", desc: "Shortlist, test, interview", bg: "bg-purple-50" },
                    { to: "/interviews", icon: <Calendar className="h-5 w-5 text-amber-600" />, label: "Interviews", desc: "Scheduled & completed", bg: "bg-amber-50" },
                  ].map(({ to, icon, label, desc, bg }) => (
                    <Link key={label} to={to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
                      <div className={`rounded-xl p-3 flex-shrink-0 ${bg}`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
