from typing import Dict, Any
from .config import WEIGHTS

def normalize_metric(value: float, min_val: float, max_val: float, invert: bool = False) -> float:
    """Normalizes a metric to a 0-100 scale."""
    if value is None:
        return 0.0
    
    if value < min_val:
        score = 0.0
    elif value > max_val:
        score = 100.0
    else:
        score = ((value - min_val) / (max_val - min_val)) * 100.0
        
    return 100.0 - score if invert else score

def calculate_skipping_scores(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates component scores from 0-100 based on extracted metrics.
    """
    scores = {}
    
    # Technique Score
    variance = metrics.get("jumpHeightVariance", {}).get("value", 0.1)
    technique = normalize_metric(variance, 0.0, 0.2, invert=True)
    scores["technique"] = {
        "score": technique,
        "confidence": metrics.get("jumpHeightVariance", {}).get("confidence", 0.0),
        "supportingMetrics": ["jumpHeightVariance"]
    }
    
    # Rhythm Score
    rhythm_val = metrics.get("rhythmConsistency", {}).get("value", 0.0)
    scores["rhythm"] = {
        "score": normalize_metric(rhythm_val, 0.5, 1.0),
        "confidence": metrics.get("rhythmConsistency", {}).get("confidence", 0.0),
        "supportingMetrics": ["rhythmConsistency"]
    }
    
    # Landing Symmetry
    sym_val = metrics.get("landingSymmetry", {}).get("value", 50)
    scores["symmetry"] = {
        "score": normalize_metric(sym_val, 50, 100),
        "confidence": metrics.get("landingSymmetry", {}).get("confidence", 0.0),
        "supportingMetrics": ["landingSymmetry"]
    }
    
    # Dummy for unavailable metrics (they pull down the score slightly or use defaults)
    scores["coordination"] = {"score": 75.0, "confidence": 0.5, "supportingMetrics": []}
    scores["efficiency"] = {"score": 80.0, "confidence": 0.5, "supportingMetrics": []}
    scores["consistency"] = {"score": scores["rhythm"]["score"], "confidence": scores["rhythm"]["confidence"], "supportingMetrics": ["rhythmConsistency"]}
    scores["landing"] = {"score": scores["symmetry"]["score"], "confidence": scores["symmetry"]["confidence"], "supportingMetrics": ["landingSymmetry"]}
    scores["endurance"] = {"score": 85.0, "confidence": 0.5, "supportingMetrics": []}
    
    return scores

def calculate_skipping_index(scores: Dict[str, Any]) -> float:
    """
    Calculates final deterministic index from 0-100.
    """
    index = 0.0
    total_weight = 0.0
    
    for comp, weight in WEIGHTS.items():
        if comp in scores:
            index += scores[comp]["score"] * weight
            total_weight += weight
            
    if total_weight == 0:
        return 0.0
        
    return index / total_weight
