from app.services.compilers.base_compiler import BaseCompiler


class OpenCodeCompiler(BaseCompiler):
    """Compiles skill spec to OpenCode SKILL.md format."""

    def file_path(self, spec: dict) -> str:
        name = self._name(spec)
        return f".opencode/skills/{name}/SKILL.md"

    def compile(self, spec: dict, agent_settings: dict | None = None) -> str:
        name = self._name(spec)
        description = self._description(spec)
        steps = spec.get("steps", [])
        constraints = spec.get("constraints", [])

        lines = [
            "---",
            f"name: {name}",
            f"description: {description}",
            "---",
            f"# {name}",
        ]

        if steps:
            lines += ["## Steps", self._format_steps(steps)]

        if constraints:
            lines += ["## Constraints", self._format_constraints(constraints)]

        return "\n".join(lines)
