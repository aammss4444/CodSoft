from abc import ABC, abstractmethod
from typing import Dict, Any

class SportAnalyzer(ABC):
    """
    Abstract base class for all sport-specific analyzers.
    Ensures a consistent interface for deterministic metric extraction, scoring,
    and LLM integration.
    """

    @property
    @abstractmethod
    def sport_code(self) -> str:
        pass

    @property
    @abstractmethod
    def activity_code(self) -> str:
        pass

    @abstractmethod
    def validate_input(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates data quality, athlete count, and activity match.
        Returns a dictionary with 'status' (e.g. 'VALID', 'REJECTED') and 'reason'.
        """
        pass

    @abstractmethod
    def extract_metrics(self, detection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts sport-specific deterministic metrics from pose/temporal data.
        """
        pass

    @abstractmethod
    def calculate_scores(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes metrics into component scores (0-100).
        """
        pass

    @abstractmethod
    def calculate_performance_index(self, scores: Dict[str, Any]) -> float:
        """
        Calculates the overall deterministic Performance Index.
        """
        pass

    @abstractmethod
    def calculate_confidence(self, context: Dict[str, Any], metrics: Dict[str, Any]) -> float:
        """
        Calculates the confidence score of the analysis based on data quality and metric availability.
        """
        pass

    @abstractmethod
    def generate_llm_context(self, metrics: Dict[str, Any], scores: Dict[str, Any], performance_index: float) -> str:
        """
        Generates the context/prompt to be passed to the LLM.
        """
        pass

    @abstractmethod
    def get_llm_schema(self) -> Dict[str, Any]:
        """
        Returns the expected JSON schema for the LLM output.
        """
        pass
