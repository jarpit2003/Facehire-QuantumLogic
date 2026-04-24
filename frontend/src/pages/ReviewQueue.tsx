import { Link } from "react-router-dom";

export default function ReviewQueue() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Review Queue</h1>
        <p className="text-sm text-gray-500 mb-6">Use the Hiring Board to manage candidates.</p>
        <Link to="/pipeline" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          Go to Hiring Board
        </Link>
      </div>
    </div>
  );
}
