"""Add translation keys to src/lib/i18n.tsx, skipping keys a locale already has.

Usage: python3 scripts/add-i18n.py keys.json   ({"es": {"Key": "Valor"}, "pt": {...}, ...})
"""
import json, re, sys
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "src/lib/i18n.tsx"
src = p.read_text()
add = json.loads(Path(sys.argv[1]).read_text())
for loc, entries in add.items():
    m = re.search(r"^" + loc + r": ?\{\n", src, re.M)
    end = re.compile(r"\n\},?\n").search(src, m.end()).start()
    block = src[m.end():end]
    new = "".join(f"{json.dumps(k, ensure_ascii=False)}:{json.dumps(v, ensure_ascii=False)}," for k, v in entries.items() if f"{json.dumps(k, ensure_ascii=False)}:" not in block)
    src = src[: m.end()] + new + "\n" * bool(new) + src[m.end():]
p.write_text(src)
