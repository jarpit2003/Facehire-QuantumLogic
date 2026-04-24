import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Eye, EyeOff, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
const FEATURES = [
    { icon: Zap, text: "AI resume scoring in seconds" },
    { icon: ShieldCheck, text: "Bias-free, structured shortlisting" },
    { icon: Sparkles, text: "Auto-generated offer letters & JDs" },
];
export default function Login() {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? "/";
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const switchMode = (next) => {
        setMode(next);
        setError(null);
        setEmail("");
        setPassword("");
        setFullName("");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === "login") {
                await login(email, password);
            }
            else {
                if (!fullName.trim()) {
                    setError("Full name is required");
                    setLoading(false);
                    return;
                }
                if (password.length < 8) {
                    setError("Password must be at least 8 characters");
                    setLoading(false);
                    return;
                }
                await register(email, password, fullName);
            }
            navigate(from, { replace: true });
        }
        catch (err) {
            setError(getApiErrorMessage(err, mode === "login" ? "Invalid email or password" : "Registration failed"));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex", children: [_jsxs("div", { className: "hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 text-white", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-16", children: [_jsx("div", { className: "bg-white/20 rounded-xl p-2", children: _jsx(Sparkles, { className: "h-6 w-6 text-white" }) }), _jsx("span", { className: "text-2xl font-bold tracking-tight", children: "FairHire AI" })] }), _jsxs("h1", { className: "text-4xl font-bold leading-tight mb-4", children: ["Hire smarter,", _jsx("br", {}), "not harder."] }), _jsx("p", { className: "text-blue-100 text-lg leading-relaxed max-w-sm", children: "Your AI-powered hiring co-pilot \u2014 from job posting to offer letter, all in one place." }), _jsx("div", { className: "mt-10 space-y-4", children: FEATURES.map(({ icon: Icon, text }) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-white/15 rounded-lg p-1.5 flex-shrink-0", children: _jsx(Icon, { className: "h-4 w-4 text-white" }) }), _jsx("span", { className: "text-blue-50 text-sm", children: text })] }, text))) })] }), _jsxs("p", { className: "text-blue-200 text-xs", children: ["\u00A9 ", new Date().getFullYear(), " FairHire AI. Built for modern HR teams."] })] }), _jsx("div", { className: "flex-1 flex items-center justify-center px-6 py-12 bg-slate-50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "lg:hidden flex items-center gap-2 mb-8 justify-center", children: [_jsx(Sparkles, { className: "h-7 w-7 text-blue-600" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: "FairHire AI" })] }), _jsx("div", { className: "flex bg-gray-100 rounded-xl p-1 mb-8", children: ["login", "register"].map((m) => (_jsx("button", { type: "button", onClick: () => switchMode(m), className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"}`, children: m === "login" ? "Sign in" : "Create account" }, m))) }), _jsxs("div", { className: "bg-white rounded-2xl shadow-card border border-gray-100 p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: mode === "login" ? "Welcome back" : "Get started free" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: mode === "login"
                                                ? "Sign in to your HR workspace"
                                                : "Create your HR account in seconds" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [mode === "register" && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-1.5", children: "Full name" }), _jsx("input", { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jane Smith", autoComplete: "name", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400", disabled: loading })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-1.5", children: "Work email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", required: true, autoComplete: "email", className: "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400", disabled: loading })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Password" }), mode === "register" && (_jsx("span", { className: "text-xs text-gray-400", children: "Min. 8 characters" }))] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: mode === "login" ? "current-password" : "new-password", className: "w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400", disabled: loading }), _jsx("button", { type: "button", onClick: () => setShowPassword((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5", tabIndex: -1, "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] })] }), error && (_jsxs("div", { className: "flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200", children: [_jsx("span", { className: "text-red-500 mt-0.5 flex-shrink-0", children: "\u26A0" }), _jsx("p", { className: "text-sm text-red-800", children: error })] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors mt-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), mode === "login" ? "Signing in…" : "Creating account…"] })) : (mode === "login" ? "Sign in to workspace" : "Create my account") })] })] }), _jsx("p", { className: "text-center text-xs text-gray-400 mt-6", children: "By continuing, you agree to FairHire AI's terms of service." })] }) })] }));
}
