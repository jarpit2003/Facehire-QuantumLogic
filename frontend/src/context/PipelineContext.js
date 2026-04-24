import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PipelineContext — stub.
 * The legacy in-memory pipeline (runRecruiterPipeline / ReviewQueue) has been removed.
 * This stub keeps imports in Layout and Jobs from breaking while those files still
 * reference setActiveJobId from this context.
 */
import { createContext, useContext, useMemo, useState } from "react";
const PipelineContext = createContext(null);
export function PipelineProvider({ children }) {
    const [activeJobId, setActiveJobId] = useState(null);
    const value = useMemo(() => ({ setActiveJobId, activeJobId }), [setActiveJobId, activeJobId]);
    return _jsx(PipelineContext.Provider, { value: value, children: children });
}
export function usePipeline() {
    const ctx = useContext(PipelineContext);
    if (!ctx)
        throw new Error("usePipeline must be used within PipelineProvider");
    return ctx;
}
