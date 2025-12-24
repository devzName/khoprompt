from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MockPromptRecord:
    id: int
    title: str
    description: str
    category: str
    tags: list[str]
    rating: float
    uses: int
    author: str
    featured: bool
    views: int
    likes: int
    dislikes: int
    full_description: str
    content: str


class MockPromptsParseError(RuntimeError):
    pass


def _read_text_any(path: Path) -> str:
    data = path.read_bytes()
    for enc in ("utf-8", "utf-8-sig", "cp1258", "cp1252", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def _skip_ws(text: str, i: int) -> int:
    while i < len(text) and text[i].isspace():
        i += 1
    return i


def _read_until(text: str, i: int, end_char: str) -> tuple[str, int]:
    out: list[str] = []
    while i < len(text):
        ch = text[i]
        if ch == end_char:
            return "".join(out), i + 1
        if ch == "\\" and i + 1 < len(text):
            out.append("\\")
            out.append(text[i + 1])
            i += 2
            continue
        out.append(ch)
        i += 1
    raise MockPromptsParseError(f"Unterminated string ending with {end_char!r}")


def _read_identifier(text: str, i: int) -> tuple[str, int]:
    i = _skip_ws(text, i)
    start = i
    while i < len(text) and (text[i].isalnum() or text[i] in "_$"):
        i += 1
    if i == start:
        raise MockPromptsParseError(f"Expected identifier at offset {i}")
    return text[start:i], i


def _read_number(text: str, i: int) -> tuple[float | int, int]:
    i = _skip_ws(text, i)
    start = i
    while i < len(text) and (text[i].isdigit() or text[i] in ".-+eE"):
        i += 1
    raw = text[start:i]
    if not raw:
        raise MockPromptsParseError(f"Expected number at offset {i}")
    if "." in raw or "e" in raw.lower():
        return float(raw), i
    return int(raw), i


def _read_bool(text: str, i: int) -> tuple[bool, int]:
    i = _skip_ws(text, i)
    if text.startswith("true", i):
        return True, i + 4
    if text.startswith("false", i):
        return False, i + 5
    raise MockPromptsParseError(f"Expected boolean at offset {i}")


def _read_string(text: str, i: int) -> tuple[str, int]:
    i = _skip_ws(text, i)
    if i >= len(text) or text[i] not in ("'", "`"):
        raise MockPromptsParseError(f"Expected string at offset {i}")
    quote = text[i]
    return _read_until(text, i + 1, quote)


def _read_array_of_strings(text: str, i: int) -> tuple[list[str], int]:
    i = _skip_ws(text, i)
    if i >= len(text) or text[i] != "[":
        raise MockPromptsParseError(f"Expected '[' at offset {i}")
    i += 1
    items: list[str] = []
    while True:
        i = _skip_ws(text, i)
        if i < len(text) and text[i] == "]":
            return items, i + 1
        item, i = _read_string(text, i)
        items.append(item)
        i = _skip_ws(text, i)
        if i < len(text) and text[i] == ",":
            i += 1
            continue
        i = _skip_ws(text, i)
        if i < len(text) and text[i] == "]":
            return items, i + 1
        raise MockPromptsParseError(f"Expected ',' or ']' at offset {i}")


def _read_value(text: str, i: int) -> tuple[object, int]:
    i = _skip_ws(text, i)
    if i >= len(text):
        raise MockPromptsParseError("Unexpected end of input while reading value")

    ch = text[i]
    if ch in ("'", "`"):
        return _read_string(text, i)
    if ch == "[":
        return _read_array_of_strings(text, i)
    if ch.isdigit() or ch in "-+":
        return _read_number(text, i)
    if text.startswith("true", i) or text.startswith("false", i):
        return _read_bool(text, i)
    raise MockPromptsParseError(f"Unsupported value at offset {i}")


def load_mock_prompts_from_js(path: Path) -> list[MockPromptRecord]:
    raw = _read_text_any(path)
    start = raw.find("mockPrompts")
    if start == -1:
        raise MockPromptsParseError("Could not find 'mockPrompts' in file")
    start = raw.find("[", start)
    end = raw.rfind("];")
    if start == -1 or end == -1 or end <= start:
        raise MockPromptsParseError("Could not find mockPrompts array bounds")

    text = raw[start : end + 1]
    i = 0
    i = _skip_ws(text, i)
    if text[i] != "[":
        raise MockPromptsParseError("Array must start with '['")
    i += 1

    records: list[MockPromptRecord] = []
    while True:
        i = _skip_ws(text, i)
        if i < len(text) and text[i] == "]":
            break
        if i >= len(text) or text[i] != "{":
            raise MockPromptsParseError(f"Expected '{{' at offset {i}")
        i += 1
        obj: dict[str, object] = {}
        while True:
            i = _skip_ws(text, i)
            if i < len(text) and text[i] == "}":
                i += 1
                break
            key, i = _read_identifier(text, i)
            i = _skip_ws(text, i)
            if i >= len(text) or text[i] != ":":
                raise MockPromptsParseError(f"Expected ':' after key at offset {i}")
            i += 1
            value, i = _read_value(text, i)
            obj[key] = value
            i = _skip_ws(text, i)
            if i < len(text) and text[i] == ",":
                i += 1
                continue
            i = _skip_ws(text, i)
            if i < len(text) and text[i] == "}":
                i += 1
                break
            raise MockPromptsParseError(f"Expected ',' or '}}' at offset {i}")

        try:
            records.append(
                MockPromptRecord(
                    id=int(obj["id"]),
                    title=str(obj["title"]),
                    description=str(obj["description"]),
                    category=str(obj["category"]),
                    tags=list(obj.get("tags", [])),  # type: ignore[arg-type]
                    rating=float(obj.get("rating", 0.0)),
                    uses=int(obj.get("uses", 0)),
                    author=str(obj.get("author", "Unknown")),
                    featured=bool(obj.get("featured", False)),
                    views=int(obj.get("views", 0)),
                    likes=int(obj.get("likes", 0)),
                    dislikes=int(obj.get("dislikes", 0)),
                    full_description=str(obj.get("fullDescription", "")),
                    content=str(obj.get("content", "")),
                )
            )
        except KeyError as e:
            raise MockPromptsParseError(f"Missing key {e} in mock prompt object") from e

        i = _skip_ws(text, i)
        if i < len(text) and text[i] == ",":
            i += 1
            continue
        i = _skip_ws(text, i)
        if i < len(text) and text[i] == "]":
            break

    return records


def default_mock_prompts_path() -> Path | None:
    repo_root = Path(__file__).resolve().parents[3]
    candidate = repo_root / "client" / "src" / "data" / "mockPrompts.js"
    return candidate if candidate.exists() else None
