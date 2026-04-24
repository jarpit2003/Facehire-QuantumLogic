import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { jobService } from "../services/api";
import { useAuth } from "./AuthContext";
const STORAGE_KEY = "fairhire_active_job_id";
const JobContext = createContext(null);
export function JobProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [activeJobId, setActiveJobIdState] = useState(() => localStorage.getItem(STORAGE_KEY));
    const [loading, setLoading] = useState(false);
    const reloadJobs = useCallback(async () => {
        if (!isAuthenticated)
            return;
        setLoading(true);
        try {
            const { data } = await jobService.list();
            const fetched = data;
            setJobs(fetched);
            // Only auto-select when nothing is stored — never overwrite an explicit selection
            setActiveJobIdState((prev) => {
                if (prev && fetched.find((j) => j.id === prev))
                    return prev;
                // stored id is stale or absent — pick first available
                const first = fetched[0]?.id ?? null;
                if (first)
                    localStorage.setItem(STORAGE_KEY, first);
                else
                    localStorage.removeItem(STORAGE_KEY);
                return first;
            });
        }
        catch {
            // silently keep stale state; network may be down
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (isAuthenticated)
            reloadJobs();
    }, [isAuthenticated, reloadJobs]);
    const setActiveJobId = useCallback((id) => {
        localStorage.setItem(STORAGE_KEY, id);
        setActiveJobIdState(id);
    }, []);
    const activeJob = useMemo(() => jobs.find((j) => j.id === activeJobId) ?? null, [jobs, activeJobId]);
    const value = useMemo(() => ({ jobs, activeJob, setActiveJobId, reloadJobs, loading }), [jobs, activeJob, setActiveJobId, reloadJobs, loading]);
    return _jsx(JobContext.Provider, { value: value, children: children });
}
export function useJobs() {
    const ctx = useContext(JobContext);
    if (!ctx)
        throw new Error("useJobs must be used within JobProvider");
    return ctx;
}
