import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ProcessResumes from "./pages/ProcessResumes";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import Interviews from "./pages/Interviews";
import Pipeline from "./pages/Pipeline";
import CandidateProfile from "./pages/CandidateProfile";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import { PipelineProvider } from "./context/PipelineContext";
import { JobProvider } from "./context/JobContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Redirect logged-in users away from landing/login to dashboard
function RedirectIfAuth({ children }) {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return _jsx(_Fragment, { children: children });
}
function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(RedirectIfAuth, { children: _jsx(Landing, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(RedirectIfAuth, { children: _jsx(Login, {}) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(RequireAuth, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/process-resumes", element: _jsx(RequireAuth, { children: _jsx(ProcessResumes, {}) }) }), _jsx(Route, { path: "/pipeline", element: _jsx(RequireAuth, { children: _jsx(Pipeline, {}) }) }), _jsx(Route, { path: "/candidates", element: _jsx(RequireAuth, { children: _jsx(Layout, { children: _jsx(Candidates, {}) }) }) }), _jsx(Route, { path: "/candidates/:candidateId", element: _jsx(RequireAuth, { children: _jsx(CandidateProfile, {}) }) }), _jsx(Route, { path: "/jobs", element: _jsx(RequireAuth, { children: _jsx(Layout, { children: _jsx(Jobs, {}) }) }) }), _jsx(Route, { path: "/interviews", element: _jsx(RequireAuth, { children: _jsx(Interviews, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(JobProvider, { children: _jsx(PipelineProvider, { children: _jsx(AppRoutes, {}) }) }) }) }));
}
