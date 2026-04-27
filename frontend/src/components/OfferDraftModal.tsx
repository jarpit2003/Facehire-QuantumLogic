import { useEffect, useState } from "react";
import { CheckCircle2, Edit3, Loader2 } from "lucide-react";
import { applicationService, type ApplicationRecord } from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";

export function OfferDraftModal({
  app,
  onClose,
  onSent,
}: {
  app: ApplicationRecord;
  onClose: () => void;
  onSent: (updated: ApplicationRecord) => void;
}) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationService.getOfferDraft(app.id)
      .then(({ data }) => setDraft(data.draft))
      .catch(() => setDraft(
        `Dear ${app.candidate_name},\n\nCongratulations! We are pleased to offer you this position.\n\nBest regards,\nFairHire AI Recruitment Team`
      ))
      .finally(() => setLoading(false));
  }, [app.id]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const { data } = await applicationService.offer(app.id, draft);
      onSent(data);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to send offer"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">Offer Letter Draft</h2>
        </div>
        <p className="text-sm text-gray-500">
          AI-generated for <strong>{app.candidate_name}</strong>. Edit before sending.
        </p>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
          />
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={sending || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {sending ? "Sending offer…" : "Send offer email"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
