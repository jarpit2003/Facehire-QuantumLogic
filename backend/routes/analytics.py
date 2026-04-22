from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.analytics import (
    AnalyticsSummary,
    CandidateMatchSummary,
    compute_analytics_summary,
    create_candidate_summary,
)
from services.jd_matcher import MatchResult, match_candidate_to_jd
from services.profile_extractor import CandidateProfile

router = APIRouter()


# ---------------------------------------------------------------------------
# Request/Response models
# ---------------------------------------------------------------------------

class CandidateProfileRequest(BaseModel):
    candidate_id: str
    skills: list[str]
    education: list[str]
    certifications: list[str]
    experience_years: int | None = None


class AnalyticsRequest(BaseModel):
    job_description: str = Field(..., min_length=10, max_length=50000)
    candidates: list[CandidateProfileRequest] = Field(..., min_items=1, max_items=100)


class ScoreDistribution(BaseModel):
    excellent: int = Field(..., description="Candidates with 80-100% fit score")
    good: int = Field(..., description="Candidates with 60-79% fit score")
    moderate: int = Field(..., description="Candidates with 40-59% fit score")
    poor: int = Field(..., description="Candidates with 0-39% fit score")


class AnalyticsResponse(BaseModel):
    total_candidates: int = Field(..., description="Total number of candidates analyzed")
    average_fit_score: float = Field(..., ge=0.0, le=100.0, description="Average fit score across all candidates")
    top_candidate_score: int = Field(..., ge=0, le=100, description="Highest fit score achieved")
    shortlisted_count: int = Field(..., description="Number of candidates recommended for shortlist")
    recommended_for_interview_count: int = Field(..., description="Number of candidates recommended for interview")
    common_missing_skills: list[str] = Field(..., description="Top 5 most commonly missing skills")
    score_distribution: ScoreDistribution = Field(..., description="Distribution of fit scores for charts")
    recommendation_breakdown: dict[str, int] = Field(..., description="Breakdown by recommendation category")
    insights: dict[str, str] = Field(..., description="Key insights for recruiter dashboard")


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post(
    "/summary",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate recruiter analytics dashboard summary",
    description=(
        "Processes multiple candidate profiles against a job description to generate "
        "comprehensive analytics for recruiter dashboard. Optimized for frontend charts "
        "and placement demos with ATS enterprise compliance."
    ),
)
async def analytics_summary(request: AnalyticsRequest) -> AnalyticsResponse:
    try:
        # Process each candidate against the JD
        candidate_summaries: list[CandidateMatchSummary] = []
        
        for candidate_req in request.candidates:
            # Convert to CandidateProfile
            profile = CandidateProfile(
                skills=tuple(candidate_req.skills),
                education=tuple(candidate_req.education),
                certifications=tuple(candidate_req.certifications),
                experience_years=candidate_req.experience_years,
            )
            
            # Perform matching
            match_result = await match_candidate_to_jd(profile, request.job_description)
            
            # Create candidate summary
            candidate_summary = create_candidate_summary(
                candidate_id=candidate_req.candidate_id,
                match_result=match_result,
            )
            candidate_summaries.append(candidate_summary)
        
        # Compute analytics summary
        analytics = compute_analytics_summary(candidate_summaries)
        
        # Generate insights
        insights = _generate_insights(analytics)
        
        return AnalyticsResponse(
            total_candidates=analytics.total_candidates,
            average_fit_score=analytics.average_fit_score,
            top_candidate_score=analytics.top_candidate_score,
            shortlisted_count=analytics.shortlisted_count,
            recommended_for_interview_count=analytics.recommended_for_interview_count,
            common_missing_skills=list(analytics.common_missing_skills),
            score_distribution=ScoreDistribution(**analytics.score_distribution),
            recommendation_breakdown=analytics.recommendation_breakdown,
            insights=insights,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics computation failed: {str(e)}",
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_insights(analytics: AnalyticsSummary) -> dict[str, str]:
    """Generate key insights for recruiter dashboard."""
    insights = {}
    
    # Quality assessment
    if analytics.average_fit_score >= 70:
        insights["quality"] = "Strong candidate pool with high average fit score"
    elif analytics.average_fit_score >= 50:
        insights["quality"] = "Moderate candidate pool with room for improvement"
    else:
        insights["quality"] = "Candidate pool may need expansion or requirement adjustment"
    
    # Interview readiness
    interview_rate = (analytics.recommended_for_interview_count / analytics.total_candidates) * 100
    if interview_rate >= 30:
        insights["readiness"] = f"Excellent: {interview_rate:.0f}% of candidates ready for interviews"
    elif interview_rate >= 15:
        insights["readiness"] = f"Good: {interview_rate:.0f}% of candidates ready for interviews"
    else:
        insights["readiness"] = f"Limited: Only {interview_rate:.0f}% ready for interviews"
    
    # Skill gaps
    if analytics.common_missing_skills:
        top_gap = analytics.common_missing_skills[0]
        insights["skill_gaps"] = f"Most common skill gap: {top_gap} - consider training programs"
    else:
        insights["skill_gaps"] = "No significant skill gaps identified"
    
    # Recommendation
    if analytics.recommended_for_interview_count >= 3:
        insights["recommendation"] = "Proceed with interviews for top candidates"
    elif analytics.shortlisted_count >= 5:
        insights["recommendation"] = "Consider expanding search or adjusting requirements"
    else:
        insights["recommendation"] = "Recommend sourcing additional candidates"
    
    return insights