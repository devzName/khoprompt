from app.services.compilers.base_compiler import BaseCompiler


class CodexCompiler(BaseCompiler):
    """Compiles skill spec to OpenAI Codex AGENTS.md section format."""

    def file_path(self, spec: dict) -> str:
        return "AGENTS.md"

    def compile(self, spec: dict, agent_settings: dict | None = None) -> str:
        name = self._name(spec)
        description = self._description(spec)
        steps = spec.get("steps", [])
        constraints = spec.get("constraints", [])

        lines = [f"## {name}", description]

        if steps:
            lines += ["### Steps", self._format_steps(steps)]

        if constraints:
            lines += ["### Rules", self._format_constraints(constraints)]

        return "\n".join(lines)
