import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, BarChart2, ArrowRight, Briefcase, CheckCircle2, Star, Upload, Brain, Trophy, ChevronRight, Mail, } from "lucide-react";
const FEATURES = [
    {
        icon: Brain,
        color: "bg-blue-50 text-blue-600",
        title: "AI-Powered Resume Scoring",
        desc: "Gemini AI reads every resume and scores candidates on skills, experience, impact, and semantic fit — in seconds.",
    },
    {
        icon: BarChart2,
        color: "bg-purple-50 text-purple-600",
        title: "Visual Hiring Pipeline",
        desc: "Kanban board tracks every candidate from Applied → Offered. Bulk shortlist, send tests, schedule interviews in one click.",
    },
    {
        icon: ShieldCheck,
        color: "bg-green-50 text-green-600",
        title: "Bias-Free Shortlisting",
        desc: "Structured scoring criteria ensure every candidate is evaluated on merit. No gut-feel, no unconscious bias.",
    },
    {
        icon: Mail,
        color: "bg-amber-50 text-amber-600",
        title: "Automated Notifications",
        desc: "Candidates get instant emails — application received, interview scheduled, offer letter — all auto-sent via Gmail.",
    },
    {
        icon: Briefcase,
        color: "bg-rose-50 text-rose-600",
        title: "One-Click Job Publishing",
        desc: "Post to LinkedIn, Naukri, and X/Twitter simultaneously. Auto-create Google Forms for candidate intake.",
    },
    {
        icon: Sparkles,
        color: "bg-indigo-50 text-indigo-600",
        title: "AI Offer Letter Drafting",
        desc: "Gemini drafts personalised offer letters for each candidate. HR reviews and sends with one click.",
    },
];
const STEPS = [
    {
        num: "01",
        icon: Briefcase,
        title: "Create & Publish Job",
        desc: "Write your JD, publish to LinkedIn / Naukri / X, and get a Google Form for applications — all in under 2 minutes.",
    },
    {
        num: "02",
        icon: Upload,
        title: "Upload Resumes",
        desc: "Drop PDF/DOCX resumes. AI parses, scores, and ranks every candidate against your JD automatically.",
    },
    {
        num: "03",
        icon: Trophy,
        title: "Hire the Best",
        desc: "Review ranked candidates, shortlist, send assessments, schedule interviews, and send offers — all from one dashboard.",
    },
];
const STATS = [
    { value: "10x", label: "Faster screening" },
    { value: "90%", label: "Reduction in manual work" },
    { value: "AI", label: "Gemini-powered scoring" },
    { value: "100%", label: "Bias-free evaluation" },
];
const TESTIMONIALS = [
    {
        name: "Priya Sharma",
        role: "HR Manager, TechCorp",
        text: "FairHire AI cut our screening time from 3 days to 3 hours. The AI scores are surprisingly accurate.",
        stars: 5,
    },
    {
        name: "Rahul Mehta",
        role: "Talent Lead, StartupXYZ",
        text: "The pipeline view is exactly what we needed. No more spreadsheets, no more missed follow-ups.",
        stars: 5,
    },
    {
        name: "Anita Verma",
        role: "Recruiter, MNC India",
        text: "Auto-generated offer letters alone save me 30 minutes per hire. Absolutely love this tool.",
        stars: 5,
    },
];
export default function Landing() {
    return (_jsxs("div", { className: "min-h-screen bg-white font-sans", children: [_jsx("nav", { className: "sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "bg-blue-600 rounded-xl p-1.5", children: _jsx(Sparkles, { className: "h-5 w-5 text-white" }) }), _jsx("span", { className: "text-lg font-bold text-gray-900 tracking-tight", children: "FairHire AI" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/login", className: "px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors", children: "Sign in" }), _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors", children: ["Get started free ", _jsx(ArrowRight, { className: "h-3.5 w-3.5" })] })] })] }) }), _jsxs("section", { className: "relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 pt-20 pb-28", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative max-w-4xl mx-auto px-6 text-center", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-8", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), "Powered by Google Gemini AI"] }), _jsxs("h1", { className: "text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight", children: ["Hire smarter,", _jsx("br", {}), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600", children: "not harder." })] }), _jsx("p", { className: "mt-6 text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto", children: "FairHire AI automates resume screening, candidate ranking, interview scheduling, and offer letters \u2014 so your HR team focuses on people, not paperwork." }), _jsxs("div", { className: "mt-10 flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:-translate-y-0.5", children: ["Start hiring for free ", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsx("a", { href: "#how-it-works", className: "inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-gray-200 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors", children: "See how it works" })] }), _jsx("div", { className: "mt-12 flex items-center justify-center gap-6 flex-wrap", children: ["No credit card required", "Setup in 2 minutes", "Free to use"].map((t) => (_jsxs("div", { className: "flex items-center gap-1.5 text-sm text-gray-500", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-500 flex-shrink-0" }), t] }, t))) })] })] }), _jsx("section", { className: "bg-blue-600 py-14", children: _jsx("div", { className: "max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8", children: STATS.map(({ value, label }) => (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-4xl font-extrabold text-white", children: value }), _jsx("p", { className: "mt-1 text-sm font-medium text-blue-200", children: label })] }, label))) }) }), _jsx("section", { className: "py-24 bg-white", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900", children: "Everything your HR team needs" }), _jsx("p", { className: "mt-4 text-lg text-gray-500 max-w-xl mx-auto", children: "From job posting to offer letter \u2014 one platform, zero spreadsheets." })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: FEATURES.map(({ icon: Icon, color, title, desc }) => (_jsxs("div", { className: "p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group", children: [_jsx("div", { className: `inline-flex p-3 rounded-xl ${color} mb-4`, children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-base font-bold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-sm text-gray-500 leading-relaxed", children: desc })] }, title))) })] }) }), _jsx("section", { id: "how-it-works", className: "py-24 bg-slate-50", children: _jsxs("div", { className: "max-w-5xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900", children: "Up and running in minutes" }), _jsx("p", { className: "mt-4 text-lg text-gray-500", children: "Three steps to your next great hire." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 relative", children: [_jsx("div", { className: "hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200" }), STEPS.map(({ num, icon: Icon, title, desc }) => (_jsx("div", { className: "relative text-center", children: _jsxs("div", { className: "inline-flex flex-col items-center", children: [_jsxs("div", { className: "relative mb-5", children: [_jsx("div", { className: "h-20 w-20 rounded-2xl bg-white border-2 border-blue-100 shadow-sm flex items-center justify-center", children: _jsx(Icon, { className: "h-8 w-8 text-blue-600" }) }), _jsx("span", { className: "absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center", children: num.slice(1) })] }), _jsx("h3", { className: "text-base font-bold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-sm text-gray-500 leading-relaxed max-w-xs", children: desc })] }) }, num)))] })] }) }), _jsx("section", { className: "py-24 bg-white", children: _jsxs("div", { className: "max-w-5xl mx-auto px-6", children: [_jsx("div", { className: "text-center mb-16", children: _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900", children: "Loved by HR teams" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: TESTIMONIALS.map(({ name, role, text, stars }) => (_jsxs("div", { className: "p-6 rounded-2xl border border-gray-100 bg-slate-50", children: [_jsx("div", { className: "flex gap-0.5 mb-4", children: Array.from({ length: stars }).map((_, i) => (_jsx(Star, { className: "h-4 w-4 text-amber-400 fill-amber-400" }, i))) }), _jsxs("p", { className: "text-sm text-gray-700 leading-relaxed mb-5", children: ["\"", text, "\""] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-gray-900", children: name }), _jsx("p", { className: "text-xs text-gray-500", children: role })] })] }, name))) })] }) }), _jsx("section", { className: "py-20 bg-gradient-to-br from-blue-600 to-indigo-700", children: _jsxs("div", { className: "max-w-3xl mx-auto px-6 text-center", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-4", children: "Ready to transform your hiring?" }), _jsx("p", { className: "text-blue-100 text-lg mb-10", children: "Join HR teams using FairHire AI to hire faster, fairer, and smarter." }), _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 text-base font-bold hover:bg-blue-50 shadow-xl transition-all hover:-translate-y-0.5", children: ["Get started free ", _jsx(ChevronRight, { className: "h-4 w-4" })] })] }) }), _jsx("footer", { className: "bg-gray-900 py-12", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "bg-blue-600 rounded-xl p-1.5", children: _jsx(Sparkles, { className: "h-4 w-4 text-white" }) }), _jsx("span", { className: "text-base font-bold text-white", children: "FairHire AI" })] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u00A9 ", new Date().getFullYear(), " FairHire AI. Built for modern HR teams."] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Link, { to: "/login", className: "text-sm text-gray-400 hover:text-white transition-colors", children: "Sign in" }), _jsx(Link, { to: "/login", className: "text-sm text-gray-400 hover:text-white transition-colors", children: "Register" })] })] }) })] }));
}
