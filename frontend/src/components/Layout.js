import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Users, Briefcase, Calendar, LayoutDashboard, FileStack, ChevronDown, Loader2, GitBranch, LogOut, ChevronRight, Menu, X, } from "lucide-react";
import { useJobs } from "../context/JobContext";
import { usePipeline } from "../context/PipelineContext";
import { useAuth } from "../context/AuthContext";
const NAV_ITEMS = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", desc: "Live hiring overview" },
    { path: "/jobs", icon: Briefcase, label: "Jobs", desc: "Manage requisitions" },
    { path: "/process-resumes", icon: FileStack, label: "Add Candidates", desc: "Upload & score CVs" },
    { path: "/pipeline", icon: GitBranch, label: "Hiring Board", desc: "Track all applicants" },
    { path: "/candidates", icon: Users, label: "Candidates", desc: "All applicants" },
    { path: "/interviews", icon: Calendar, label: "Interviews", desc: "Scheduled sessions" },
];
function JobSwitcher({ collapsed }) {
    const { jobs, activeJob, setActiveJobId, loading } = useJobs();
    const { setActiveJobId: setPipelineJobId } = usePipeline();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const handleSelect = (id) => {
        setActiveJobId(id);
        setPipelineJobId(id);
        setOpen(false);
    };
    if (loading && jobs.length === 0) {
        return (_jsxs("div", { className: "mx-3 px-3 py-2 rounded-xl bg-slate-100 flex items-center gap-2 text-xs text-slate-500", children: [_jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin flex-shrink-0" }), !collapsed && _jsx("span", { children: "Loading jobs\u2026" })] }));
    }
    if (jobs.length === 0) {
        return (_jsxs(Link, { to: "/jobs", className: "mx-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-blue-200 flex items-center gap-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors", children: [_jsx(Briefcase, { className: "h-4 w-4 flex-shrink-0" }), !collapsed && _jsx("span", { children: "Create first job" })] }));
    }
    return (_jsxs("div", { className: "relative mx-3", ref: ref, children: [_jsxs("button", { type: "button", onClick: () => setOpen((o) => !o), className: "w-full px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-sm font-medium text-blue-900 hover:bg-blue-100 transition-colors", title: activeJob?.title ?? "Select job", children: [_jsx("div", { className: "h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0", children: _jsx(Briefcase, { className: "h-3.5 w-3.5 text-white" }) }), !collapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "truncate flex-1 text-left text-xs font-semibold", children: activeJob?.title ?? "Select a job" }), _jsx(ChevronDown, { className: `h-3.5 w-3.5 text-blue-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}` })] }))] }), open && (_jsxs("div", { className: "absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 max-h-64 overflow-y-auto", children: [_jsx("p", { className: "px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Active job" }), jobs.map((job) => (_jsxs("button", { type: "button", onClick: () => handleSelect(job.id), className: `w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${job.id === activeJob?.id ? "bg-blue-50 text-blue-900 font-semibold" : "text-gray-700 hover:bg-slate-50"}`, children: [job.id === activeJob?.id ? _jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0 ml-0.5" }) : _jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-gray-200 flex-shrink-0 ml-0.5" }), _jsx("span", { className: "truncate", children: job.title })] }, job.id))), _jsx("div", { className: "border-t border-gray-100 mt-1 pt-1", children: _jsxs(Link, { to: "/jobs", onClick: () => setOpen(false), className: "flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors", children: [_jsx("span", { className: "text-lg leading-none", children: "+" }), " New requisition"] }) })] }))] }));
}
function SidebarContent({ collapsed, onNavClick, user, logout }) {
    const location = useLocation();
    const initials = user?.full_name
        ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "HR";
    return (_jsxs("div", { className: "flex flex-col h-full", children: [
        _jsxs("div", { className: `flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0 ${collapsed ? "justify-center" : ""}`, children: [_jsx("div", { className: "bg-blue-600 rounded-xl p-1.5 flex-shrink-0", children: _jsx(Sparkles, { className: "h-5 w-5 text-white" }) }), !collapsed && (_jsx("span", { className: "text-base font-bold text-slate-900 tracking-tight", children: "FairHire AI" }))] }),
        _jsxs("div", { className: "py-3 border-b border-slate-100 flex-shrink-0", children: [!collapsed && (_jsx("p", { className: "px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Active Job" })), _jsx(JobSwitcher, { collapsed: collapsed })] }),
        _jsx("nav", { className: "flex-1 py-4 space-y-0.5 px-2 overflow-y-auto", children: NAV_ITEMS.map(({ path, icon: Icon, label, desc }) => {
            const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
            return (_jsxs(Link, { to: path, onClick: onNavClick, title: collapsed ? label : undefined, className: `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`, children: [_jsx(Icon, { className: `h-4.5 w-4.5 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`, style: { height: "1.125rem", width: "1.125rem" } }), !collapsed && (_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: `font-semibold text-sm leading-tight ${active ? "text-white" : ""}`, children: label }), _jsx("div", { className: `text-xs leading-tight mt-0.5 ${active ? "text-blue-100" : "text-slate-400"}`, children: desc })] })), !collapsed && active && _jsx(ChevronRight, { className: "h-3.5 w-3.5 text-blue-200 flex-shrink-0" })] }, path));
        }) }),
        _jsxs("div", { className: "border-t border-slate-100 p-3 flex-shrink-0", children: [_jsxs("div", { className: `flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors ${collapsed ? "justify-center" : ""}`, children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-xs font-bold text-white", children: initials }) }), !collapsed && (_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-slate-900 truncate", children: user?.full_name ?? "HR User" }), _jsx("p", { className: "text-xs text-slate-400 truncate capitalize", children: user?.role ?? "recruiter" })] })), !collapsed && (_jsx("button", { type: "button", onClick: logout, title: "Sign out", className: "p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0", children: _jsx(LogOut, { className: "h-4 w-4" }) }))] }), collapsed && (_jsx("button", { type: "button", onClick: logout, title: "Sign out", className: "w-full mt-1 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex justify-center", children: _jsx(LogOut, { className: "h-4 w-4" }) }))] })
    ] }));
}
export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    return (_jsxs("div", { className: "min-h-screen flex bg-slate-50", children: [
        _jsxs("aside", { className: `hidden lg:flex flex-col bg-white border-r border-slate-100 shadow-sm flex-shrink-0 transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`, style: { position: "sticky", top: 0, height: "100vh" }, children: [
            _jsx(SidebarContent, { collapsed: collapsed, onNavClick: () => {}, user: user, logout: logout }),
            _jsx("button", { type: "button", onClick: () => setCollapsed((c) => !c), className: "absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors z-10", title: collapsed ? "Expand sidebar" : "Collapse sidebar", children: _jsx(ChevronRight, { className: `h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}` }) })
        ] }),
        _jsxs("div", { className: "lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm h-14 flex items-center justify-between px-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-blue-600 rounded-lg p-1", children: _jsx(Sparkles, { className: "h-4 w-4 text-white" }) }), _jsx("span", { className: "font-bold text-slate-900", children: "FairHire AI" })] }), _jsx("button", { type: "button", onClick: () => setMobileOpen((o) => !o), className: "p-2 rounded-lg text-slate-500 hover:bg-slate-100", children: mobileOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) })] }),
        mobileOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "lg:hidden fixed inset-0 z-30 bg-black/30", onClick: () => setMobileOpen(false) }), _jsx("aside", { className: "lg:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-white shadow-xl flex flex-col", children: _jsx(SidebarContent, { collapsed: false, onNavClick: () => setMobileOpen(false), user: user, logout: logout }) })] })),
        _jsx("div", { className: "flex-1 flex flex-col min-w-0", children: _jsx("main", { className: "flex-1 p-6 lg:p-8 mt-14 lg:mt-0 max-w-7xl w-full mx-auto", children: children }) })
    ] }));
}
