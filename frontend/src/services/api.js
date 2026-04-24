import axios from "axios";
const api = axios.create({ baseURL: "/api/v1" });
// Inject JWT on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("fairhire_token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});
export const candidateService = {
    list: () => api.get("/candidates/"),
    get: (id) => api.get(`/candidates/${id}`),
    create: (data) => api.post("/candidates/", data),
};
export const jobService = {
    list: () => api.get("/jobs/"),
    get: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post("/jobs/", data),
};
export const applicationService = {
    list: (jobId) => api.get(`/applications/?job_id=${jobId}`),
    listByCandidate: (candidateId) => api.get(`/applications/by-candidate/${candidateId}`),
    get: (id) => api.get(`/applications/${id}`),
    create: (data) => api.post("/applications/", data),
    advanceStage: (id, stage) => api.patch(`/applications/${id}/stage`, { stage }),
    shortlist: (id) => api.patch(`/applications/${id}/stage`, { stage: "shortlisted" }),
    recordTestScore: (id, test_score) => api.post(`/applications/${id}/test-score`, { test_score }),
    sendTestLink: (id, test_link, deadline) => api.post(`/applications/${id}/send-test-link`, { test_link, deadline }),
    updateWeights: (id, resume_weight, test_weight) => api.patch(`/applications/${id}/weights`, { resume_weight, test_weight }),
    getOfferDraft: (id) => api.get(`/applications/${id}/offer-draft`),
    reject: (id) => api.post(`/applications/${id}/reject`),
    offer: (id, draft) => api.post(`/applications/${id}/offer`, { draft }),
};
export const interviewService = {
    list: (jobId) => api.get(jobId ? `/interviews/?job_id=${jobId}` : "/interviews/"),
    schedule: (data) => api.post("/interviews/", data),
    submitScore: (id, score, feedback) => api.patch(`/interviews/${id}/score`, { score, feedback }),
    updateStatus: (id, status) => api.patch(`/interviews/${id}/status`, { status }),
};
export const analyticsService = {
    summary: (data) => api.post("/analytics/summary", data),
};
/** POST /api/v1/upload/resume — multipart field name must be `file`. */
export const uploadService = {
    resume: (file) => {
        const body = new FormData();
        body.append("file", file);
        return api.post("/upload/resume", body);
    },
};
/** POST /api/v1/match/jd — per-candidate shortlist / fit scoring. */
export const matchService = {
    matchJd: (data) => api.post("/match/jd", data),
};
