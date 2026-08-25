LLM_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "strengths": {
            "type": "array",
            "items": {"type": "string"}
        },
        "areasForImprovement": {
            "type": "array",
            "items": {"type": "string"}
        },
        "technicalObservations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "fatigueObservations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "recommendations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "detectedIssues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "issue": {"type": "string"},
                    "severity": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH"]},
                    "evidence": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["issue", "severity", "evidence"]
            }
        }
    },
    "required": [
        "summary", 
        "strengths", 
        "areasForImprovement", 
        "technicalObservations", 
        "fatigueObservations", 
        "recommendations", 
        "detectedIssues"
    ]
}
