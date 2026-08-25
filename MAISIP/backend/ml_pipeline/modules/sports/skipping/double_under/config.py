# Configuration and weights for Skipping - Double Under
SCORING_VERSION = "skipping-double-under-v1"

# Weights must sum to 1.0
WEIGHTS = {
    "technique": 0.20,
    "rhythm": 0.15,
    "coordination": 0.15,
    "efficiency": 0.15,
    "consistency": 0.15,
    "landing": 0.10,
    "symmetry": 0.05,
    "endurance": 0.05
}

# Required minimum confidence for data to be scorable
MIN_CONFIDENCE_THRESHOLD = 60.0

# Expected target video length
TARGET_DURATION_SECONDS = 30.0
