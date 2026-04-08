from app.services.compilers.base_compiler import BaseCompiler


class CopilotCompiler(BaseCompiler):
    """Compiles skill spec to GitHub Copilot instructions format."""

    def file_path(self, spec: dict) -> str:
        name = self._name(spec)
        return f".github/instructions/{name}.instructions.md"

    def compile(self, spec: dict, agent_settings: dict | None = None) -> str:
        name = self._name(spec)
        description = self._description(spec)
        steps = spec.get("steps", [])
        constraints = spec.get("constraints", [])

        apply_to = "**/*"
        if agent_settings:
            apply_to = agent_settings.get("copilot_apply_to", "**/*")

        lines = [
            "---",
            f"description: {description}",
            f'applyTo: "{apply_to}"',
            "---",
            f"When performing {name}:",
            self._format_steps(steps),
        ]

        if constraints:
            lines += ["Rules:", self._format_constraints(constraints)]

        return "\n".join(lines)
