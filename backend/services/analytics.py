"""
Recruiter analytics service for dashboard summary.
Processes ranked shortlist results and computes key metrics for placement demos.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import Any

from services.jd_matcher import MatchResult


@dataclass(frozen=True, slots=True)
class CandidateMatchSummary:
    """Individual candidate match summary for analytics."""
    candidate_id: str
    fit_score: int
    matched_skills: tuple[str, ...]
    missing_skills: tuple[str, ...]
    recommendation: str


@dataclass(frozen=True, slots=True)
class AnalyticsSummary:
    """Recruiter dashboard analytics summary."""
    total_candidates: int
    average_fit_score: float
    top_candidate_score: int
    shortlisted_count: int
    recommended_for_interview_count: int
    common_missing_skills: tuple[str, ...]
    score_distribution: dict[str, int]
    recommendation_breakdown: dict[str, int]


def compute_analytics_summary(candidates: list[CandidateMatchSummary]) -> AnalyticsSummary:
    """Compute comprehensive analytics summary from candidate match results."""
    if not candidates:
        return _empty_summary()
    
    # Basic metrics
    total_candidates = len(candidates)
    fit_scores = [c.fit_score for c in candidates]
    average_fit_score = sum(fit_scores) / len(fit_scores)
    top_candidate_score = max(fit_scores)
    
    # Recommendation counts
    recommendations = [c.recommendation for c in candidates]
    recommendation_counts = Counter(recommendations)
    
    shortlisted_count = recommendation_counts.get("shortlisted", 0)
    recommended_for_interview_count = recommendation_counts.get("interview", 0)
    
    # Common missing skills (top 5)
    all_missing_skills = []
    for candidate in candidates:
        all_missing_skills.extend(candidate.missing_skills)
    
    missing_skill_counts = Counter(all_missing_skills)
    common_missing_skills = tuple(skill for skill, _ in missing_skill_counts.most_common(5))
    
    # Score distribution for charts
    score_distribution = _compute_score_distribution(fit_scores)
    
    return AnalyticsSummary(
        total_candidates=total_candidates,
        average_fit_score=round(average_fit_score, 1),
        top_candidate_score=top_candidate_score,
        shortlisted_count=shortlisted_count,
        recommended_for_interview_count=recommended_for_interview_count,
        common_missing_skills=common_missing_skills,
        score_distribution=score_distribution,
        recommendation_breakdown=dict(recommendation_counts),
    )


def create_candidate_summary(
    candidate_id: str,
    match_result: MatchResult,
) -> CandidateMatchSummary:
    """Create candidate summary from match result."""
    recommendation = _determine_recommendation(match_result.fit_score)
    
    return CandidateMatchSummary(
        candidate_id=candidate_id,
        fit_score=match_result.fit_score,
        matched_skills=match_result.matched_skills,
        missing_skills=match_result.missing_skills,
        recommendation=recommendation,
    )


def _determine_recommendation(fit_score: int) -> str:
    """Determine recommendation category based on fit score."""
    if fit_score >= 80:
        return "interview"
    elif fit_score >= 60:
        return "shortlisted"
    elif fit_score >= 40:
        return "consider"
    else:
        return "reject"


def _compute_score_distribution(scores: list[int]) -> dict[str, int]:
    """Compute score distribution for frontend charts."""
    distribution = {
        "excellent": 0,    # 80-100
        "good": 0,         # 60-79
        "moderate": 0,     # 40-59
        "poor": 0,         # 0-39
    }
    
    for score in scores:
        if score >= 80:
            distribution["excellent"] += 1
        elif score >= 60:
            distribution["good"] += 1
        elif score >= 40:
            distribution["moderate"] += 1
        else:
            distribution["poor"] += 1
    
    return distribution


def _empty_summary() -> AnalyticsSummary:
    """Return empty analytics summary for no candidates."""
    return AnalyticsSummary(
        total_candidates=0,
        average_fit_score=0.0,
        top_candidate_score=0,
        shortlisted_count=0,
        recommended_for_interview_count=0,
        common_missing_skills=(),
        score_distribution={"excellent": 0, "good": 0, "moderate": 0, "poor": 0},
        recommendation_breakdown={},
    )