import axios from "axios";
/** Best-effort message from FastAPI `{ detail: string | object }` or generic errors. */
export function getApiErrorMessage(error, fallback = "Request failed") {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        const d = data?.detail;
        if (typeof d === "string")
            return d;
        if (Array.isArray(d)) {
            const parts = d.map((x) => typeof x === "object" && x !== null && "msg" in x ? String(x.msg) : String(x));
            return parts.join("; ");
        }
        if (error.message)
            return error.message;
    }
    if (error instanceof Error)
        return error.message;
    return fallback;
}
