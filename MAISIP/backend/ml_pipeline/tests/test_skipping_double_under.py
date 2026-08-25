import pytest
from modules.sports.skipping.double_under.analyzer import DoubleUnderAnalyzer

@pytest.fixture
def analyzer():
    return DoubleUnderAnalyzer()

def test_extract_metrics(analyzer):
    mock_detection_data = {
        "pose": {"pose_score": 90, "anomalies": 2},
        "temporal": {"temporal_score": 85}
    }
    metrics = analyzer.extract_metrics(mock_detection_data)
    
    # Check deterministic logic
    assert metrics["totalJumps"]["value"] == 48
    assert metrics["successfulJumps"]["value"] == 43
    assert metrics["ropeRotationRate"]["availability"] == "UNAVAILABLE"
    assert metrics["jumpHeightVariance"]["value"] == 0.07

def test_calculate_scores(analyzer):
    mock_metrics = {
        "jumpHeightVariance": {"value": 0.05, "confidence": 0.9},
        "rhythmConsistency": {"value": 0.8, "confidence": 0.85},
        "landingSymmetry": {"value": 90, "confidence": 0.9}
    }
    scores = analyzer.calculate_scores(mock_metrics)
    
    assert scores["technique"]["score"] == pytest.approx(75.0) # (1 - 0.05/0.2) * 100
    assert scores["rhythm"]["score"] == pytest.approx(60.0) # (0.8 - 0.5)/(1 - 0.5) * 100
    assert scores["symmetry"]["score"] == pytest.approx(80.0) # (90 - 50)/(100 - 50) * 100

def test_calculate_index(analyzer):
    mock_scores = {
        "technique": {"score": 80.0},
        "rhythm": {"score": 70.0},
        "coordination": {"score": 75.0},
        "efficiency": {"score": 80.0},
        "consistency": {"score": 70.0},
        "landing": {"score": 80.0},
        "symmetry": {"score": 90.0},
        "endurance": {"score": 85.0}
    }
    index = analyzer.calculate_performance_index(mock_scores)
    # 80*0.2 + 70*0.15 + 75*0.15 + 80*0.15 + 70*0.15 + 80*0.1 + 90*0.05 + 85*0.05
    # 16 + 10.5 + 11.25 + 12 + 10.5 + 8 + 4.5 + 4.25 = 77.0
    assert index == 77.0

def test_validation_low_confidence(analyzer):
    context = {"pose": {"pose_score": 20}}
    result = analyzer.validate_input(context)
    assert result["status"] == "REJECTED"
    assert result["reason"] == "LOW_POSE_CONFIDENCE"

def test_validation_valid(analyzer):
    context = {"pose": {"pose_score": 85}}
    result = analyzer.validate_input(context)
    assert result["status"] == "VALID"
