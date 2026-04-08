from abc import ABC, abstractmethod


class BaseCompiler(ABC):
    """Abstract base for all agent-specific skill compilers."""

    @abstractmethod
    def compile(self, spec: dict, agent_settings: dict | None = None) -> str:
        """Return compiled markdown string for the agent format."""
        pass

    @abstractmethod
    def file_path(self, spec: dict) -> str:
        """Return the target file path for this agent's format."""
        pass

    # ------------------------------------------------------------------
    # Shared formatting helpers
    # ------------------------------------------------------------------

    def _name(self, spec: dict) -> str:
        return spec.get("metadata", {}).get("name", "skill")

    def _description(self, spec: dict) -> str:
        return spec.get("metadata", {}).get("description", "")

    def _format_steps(self, steps: list[str]) -> str:
        return "\n".join(f"{i + 1}. {s}" for i, s in enumerate(steps))

    def _format_constraints(self, constraints: list[str]) -> str:
        return "\n".join(f"- {c}" for c in constraints)
