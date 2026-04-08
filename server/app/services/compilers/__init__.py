from app.services.compilers.claude_compiler import ClaudeCompiler
from app.services.compilers.copilot_compiler import CopilotCompiler
from app.services.compilers.cursor_compiler import CursorCompiler
from app.services.compilers.codex_compiler import CodexCompiler
from app.services.compilers.opencode_compiler import OpenCodeCompiler

# Registry mapping agent identifier -> compiler instance
COMPILERS: dict[str, "ClaudeCompiler | CopilotCompiler | CursorCompiler | CodexCompiler | OpenCodeCompiler"] = {
    "claude": ClaudeCompiler(),
    "copilot": CopilotCompiler(),
    "cursor": CursorCompiler(),
    "codex": CodexCompiler(),
    "opencode": OpenCodeCompiler(),
}

__all__ = ["COMPILERS"]
