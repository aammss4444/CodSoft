import json
from typing import Dict, Any
from ...base_analyzer import SportAnalyzer
from .metrics import extract_double_under_metrics
from .scoring import calculate_skipping_scores, calculate_skipping_index
from .schema import LLM_JSON_SCHEMA
from .prompts import SYSTEM_PROMPT
from .config import SCORING_VERSION

class DoubleUnderAnalyzer(SportAnalyzer):
    @property
    def sport_code(self) -> str:
        return "SKIPPING"

    @property
    def activity_code(self) -> str:
        return "DOUBLE_UNDER"

    def validate_input(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates basic requirements like 1 athlete, 30s video.
        """
        video_metadata = context.get("video_metadata", {})
        pose_data = context.get("pose", {})
        
        # In a real system, we would check athlete tracking bounding boxes.
        # For this prototype, if MediaPipe fails to find poses, we reject.
        if pose_data.get("pose_score", 0) < 30:
            return {
                "status": "REJECTED",
                "reason": "LOW_POSE_CONFIDENCE"
            }
            
        return {
            "status": "VALID",
            "reason": "OK"
        }

    def extract_metrics(self, detection_data: Dict[str, Any]) -> Dict[str, Any]:
        return extract_double_under_metrics(detection_data)

    def calculate_scores(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        return calculate_skipping_scores(metrics)

    def calculate_performance_index(self, scores: Dict[str, Any]) -> float:
        return calculate_skipping_index(scores)

    def calculate_confidence(self, context: Dict[str, Any], metrics: Dict[str, Any]) -> float:
        pose_score = context.get("pose", {}).get("pose_score", 100)
        temporal_score = context.get("temporal", {}).get("temporal_score", 100)
        return (pose_score * 0.6) + (temporal_score * 0.4)

    def generate_llm_context(self, metrics: Dict[str, Any], scores: Dict[str, Any], performance_index: float) -> str:
        context_data = {
            "sport": self.sport_code,
            "activity": self.activity_code,
            "performanceIndex": performance_index,
            "scoringVersion": SCORING_VERSION,
            "metrics": metrics,
            "componentScores": scores
        }
        return SYSTEM_PROMPT.format(context=json.dumps(context_data, indent=2))

    def get_llm_schema(self) -> Dict[str, Any]:
        return LLM_JSON_SCHEMA
