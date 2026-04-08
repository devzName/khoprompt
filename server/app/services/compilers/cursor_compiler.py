from app.services.compilers.base_compiler import BaseCompiler


class CursorCompiler(BaseCompiler):
    """Compiles skill spec to Cursor .mdc rules format."""

    def file_path(self, spec: dict) -> str:
        name = self._name(spec)
        return f".cursor/rules/{name}.mdc"

    def compile(self, spec: dict, agent_settings: dict | None = None) -> str:
        name = self._name(spec)
        description = self._description(spec)
        steps = spec.get("steps", [])
        constraints = spec.get("constraints", [])

        always_apply = False
        globs = ""
        if agent_settings:
            always_apply = agent_settings.get("cursor_always_apply", False)
            globs = agent_settings.get("cursor_globs") or ""

        lines = [
            "---",
            f"description: {description}",
            f"alwaysApply: {str(always_apply).lower()}",
            f'globs: "{globs}"',
            "---",
            f"# {name}",
        ]

        if steps:
            lines += ["## Steps", self._format_steps(steps)]

        if constraints:
            lines += ["## Constraints", self._format_constraints(constraints)]

        return "\n".join(lines)
