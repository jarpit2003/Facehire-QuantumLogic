import { useCallback, useEffect, useState } from "react";
import { Users, Copy, CheckCircle2, Loader2, RefreshCw, Shield } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
import axios from "axios";

interface HRUserRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function HRUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<HRUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("fairhire_token");
      const { data } = await axios.get("/api/v1/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load HR users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-purple-100 text-purple-800";
    if (role === "interviewer") return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 rounded-xl p-3 flex-shrink-0">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Users</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Copy a user's UUID to assign them as an interviewer when scheduling.
                </p>
              </div>
            </div>
            <button onClick={load} disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
        )}

        {loading && users.length === 0 ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No HR users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u.id} className={`px-6 py-4 flex items-center gap-4 ${u.id === user?.user_id ? "bg-blue-50/40" : ""}`}>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{u.full_name}</p>
                      {u.id === user?.user_id && (
                        <span className="text-xs text-blue-600 font-medium">(you)</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{u.id}</p>
                  </div>
                  <button
                    onClick={() => copy(u.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex-shrink-0"
                  >
                    {copied === u.id ? (
                      <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy UUID</>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Copy a UUID and paste it into the <strong>Interviewer ID</strong> field when scheduling an interview in the Pipeline. The interviewer will receive an automatic email notification.
          </p>
        </div>
      </div>
    </Layout>
  );
}
